import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';
import { generateSummary } from '@/lib/actions/ai-actions';

export async function GET(
    req: NextRequest,
    { params }: { params: { responseId: string; }; }
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

        // Get response with survey ownership check
        const responses = await db`
      SELECT r.*, s.creator_id
      FROM responses r
      JOIN surveys s ON r.survey_id = s.id
      WHERE r.id = ${params.responseId}
      AND s.creator_id = ${userId}
      AND r.deleted_at IS NULL
    `;

        if (responses.length === 0) {
            return createApiError('NOT_FOUND', 'Response not found', 404);
        }

        let response = responses[0];

        // Check if we need to generate a summary
        const needsSummary = !response.summary ||
            (!response.summary_generated_at ||
                new Date(response.completed_at) > new Date(response.summary_generated_at));

        if (needsSummary && response.conversation) {
            try {
                // Generate summary
                const summaryResult = await generateSummary(response.conversation);

                if (summaryResult.success && summaryResult.summary) {
                    // Update the response with the new summary
                    await db`
            UPDATE responses 
            SET 
              summary = ${summaryResult.summary},
              summary_generated_at = CURRENT_TIMESTAMP
            WHERE id = ${response.id}
          `;

                    response.summary = summaryResult.summary;
                    response.summary_generated_at = new Date();
                }
            } catch (error) {
                console.error(`Failed to generate summary for response ${response.id}:`, error);
                // Continue without failing the entire request
            }
        }

        // Format response
        const formattedResponse = NextResponse.json({
            data: {
                id: response.id,
                type: 'response',
                attributes: {
                    survey_id: response.survey_id,
                    respondent_email: response.respondent_email,
                    respondent_name: response.respondent_name,
                    conversation: response.conversation,
                    summary: response.summary,
                    summary_generated_at: response.summary_generated_at,
                    tags: response.tags,
                    insight_level: response.insight_level,
                    insight_explanation: response.insight_explanation,
                    completed_at: response.completed_at,
                    updated_at: response.updated_at,
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(formattedResponse, rateLimitInfo);
    } catch (error) {
        console.error('Error fetching response:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 