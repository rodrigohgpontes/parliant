import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: { exportId: string; }; }
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
        // Get user ID from auth0_id
        const users = await db`SELECT id FROM users WHERE auth0_id = ${apiUser.sub}`;
        if (users.length === 0) {
            return createApiError('NOT_FOUND', 'User not found', 404);
        }
        const userId = users[0].id;

        // Get export record
        const exports = await db`
      SELECT * FROM exports
      WHERE id = ${params.exportId}
      AND user_id = ${userId}
    `;

        if (exports.length === 0) {
            return createApiError('NOT_FOUND', 'Export not found', 404);
        }

        const exportRecord = exports[0];

        // Check if export has expired
        if (exportRecord.expires_at && new Date(exportRecord.expires_at) < new Date()) {
            return createApiError('GONE', 'Export has expired', 410);
        }

        // Format response
        const response = NextResponse.json({
            data: {
                id: exportRecord.id,
                type: 'export',
                attributes: {
                    export_id: exportRecord.id,
                    status: exportRecord.status,
                    format: exportRecord.format,
                    created_at: exportRecord.created_at,
                    completed_at: exportRecord.completed_at,
                    expires_at: exportRecord.expires_at,
                    download_url: exportRecord.status === 'completed' ? exportRecord.download_url : null,
                    error: exportRecord.status === 'failed' ? exportRecord.error : null
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error fetching export status:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 