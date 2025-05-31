import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Create exports table if not exists
const createExportsTableIfNotExists = async () => {
    try {
        await db`
      CREATE TABLE IF NOT EXISTS exports (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL,
        survey_id uuid NOT NULL,
        format text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        download_url text,
        error text,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        completed_at timestamp with time zone,
        expires_at timestamp with time zone,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
      )
    `;
    } catch (error) {
        console.log('Exports table creation:', error);
    }
};

export async function POST(
    req: NextRequest,
    { params }: { params: { surveyId: string; }; }
) {
    // Validate token
    const apiUser = await validateApiToken(req);
    if (!apiUser) {
        return createApiError('AUTHENTICATION_ERROR', 'Invalid or missing access token', 401);
    }

    // Check scope
    if (!hasScope(apiUser.scope, 'responses:read')) {
        return createApiError('AUTHORIZATION_ERROR', 'Insufficient scope', 403);
    }

    // Get user tier and check rate limit
    const userTier = await getUserTier(apiUser.sub);
    const rateLimitResponse = await rateLimitMiddleware(req, apiUser.azp, userTier);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        await createExportsTableIfNotExists();

        // Get user ID from auth0_id
        const users = await db`SELECT id FROM users WHERE auth0_id = ${apiUser.sub}`;
        if (users.length === 0) {
            return createApiError('NOT_FOUND', 'User not found', 404);
        }
        const userId = users[0].id;

        // Verify survey ownership
        const surveys = await db`
      SELECT id FROM surveys
      WHERE id = ${params.surveyId}
      AND creator_id = ${userId}
    `;

        if (surveys.length === 0) {
            return createApiError('NOT_FOUND', 'Survey not found', 404);
        }

        const body = await req.json();
        const { format = 'json', filters = {} } = body;

        // Validate format
        if (!['json', 'csv'].includes(format)) {
            return createApiError('VALIDATION_ERROR', 'Invalid format', 400, {
                field: 'format',
                issue: 'Must be either "json" or "csv"'
            });
        }

        // Create export record
        const exports = await db`
      INSERT INTO exports (
        user_id,
        survey_id,
        format,
        status
      ) VALUES (
        ${userId},
        ${params.surveyId},
        ${format},
        'pending'
      ) RETURNING *
    `;

        const exportRecord = exports[0];

        // In a production environment, you would trigger an async job here
        // For this example, we'll process it inline
        processExport(exportRecord.id, userId, params.surveyId, format, filters);

        // Format response
        const response = NextResponse.json({
            data: {
                id: exportRecord.id,
                type: 'export',
                attributes: {
                    export_id: exportRecord.id,
                    status: 'pending',
                    format: exportRecord.format,
                    created_at: exportRecord.created_at,
                    download_url: null,
                    expires_at: null
                }
            }
        }, { status: 202 }); // 202 Accepted

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error creating export:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
}

// Process export (in production, this would be a background job)
async function processExport(
    exportId: string,
    userId: string,
    surveyId: string,
    format: string,
    filters: any
) {
    try {
        // Get responses
        let responses = await db`
      SELECT * FROM responses
      WHERE survey_id = ${surveyId}
      AND deleted_at IS NULL
      ORDER BY completed_at DESC
    `;

        // Apply filters if any
        if (filters.completed_after) {
            const date = new Date(filters.completed_after);
            responses = responses.filter((r: any) => new Date(r.completed_at) >= date);
        }
        if (filters.completed_before) {
            const date = new Date(filters.completed_before);
            responses = responses.filter((r: any) => new Date(r.completed_at) <= date);
        }
        if (filters.tags && Array.isArray(filters.tags)) {
            responses = responses.filter((r: any) =>
                r.tags && filters.tags.some((tag: string) => r.tags.includes(tag))
            );
        }

        let content: string;
        let mimeType: string;
        let fileExtension: string;

        if (format === 'csv') {
            // Generate CSV
            mimeType = 'text/csv';
            fileExtension = 'csv';
            content = generateCSV(responses);
        } else {
            // Generate JSON
            mimeType = 'application/json';
            fileExtension = 'json';
            content = JSON.stringify(responses, null, 2);
        }

        // In production, you would upload to S3 or similar
        // For this example, we'll store a data URL
        const dataUrl = `data:${mimeType};base64,${Buffer.from(content).toString('base64')}`;

        // Update export record
        await db`
      UPDATE exports
      SET 
        status = 'completed',
        download_url = ${dataUrl},
        completed_at = CURRENT_TIMESTAMP,
        expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours'
      WHERE id = ${exportId}
    `;
    } catch (error) {
        console.error('Error processing export:', error);

        // Update export record with error
        await db`
      UPDATE exports
      SET 
        status = 'failed',
        error = ${error instanceof Error ? error.message : 'Unknown error'},
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ${exportId}
    `;
    }
}

function generateCSV(responses: any[]): string {
    if (responses.length === 0) {
        return 'No data';
    }

    // CSV headers
    const headers = [
        'ID',
        'Respondent Email',
        'Respondent Name',
        'Summary',
        'Tags',
        'Insight Level',
        'Insight Explanation',
        'Completed At'
    ];

    // Generate CSV rows
    const rows = responses.map(r => [
        r.id,
        r.respondent_email || '',
        r.respondent_name || '',
        (r.summary || '').replace(/"/g, '""'), // Escape quotes
        (r.tags || []).join(';'),
        r.insight_level || '',
        (r.insight_explanation || '').replace(/"/g, '""'),
        r.completed_at
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
} 