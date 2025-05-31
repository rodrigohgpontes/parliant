import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { responseId: string; }; }
) {
    // Validate token
    const apiUser = await validateApiToken(req);
    if (!apiUser) {
        return createApiError('AUTHENTICATION_ERROR', 'Invalid or missing access token', 401);
    }

    // Check scope
    if (!hasScope(apiUser.scope, 'responses:write')) {
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

        const body = await req.json();
        const { summary, tags, insight_level, insight_explanation } = body;

        // Validate insight level if provided
        if (insight_level !== undefined) {
            const level = parseInt(insight_level, 10);
            if (isNaN(level) || level < 0 || level > 10) {
                return createApiError('VALIDATION_ERROR', 'Invalid insight level', 400, {
                    field: 'insight_level',
                    issue: 'Must be a number between 0 and 10'
                });
            }
        }

        // Validate tags if provided
        if (tags !== undefined && !Array.isArray(tags)) {
            return createApiError('VALIDATION_ERROR', 'Invalid tags format', 400, {
                field: 'tags',
                issue: 'Must be an array of strings'
            });
        }

        // Get survey tags to validate response tags are a subset
        if (tags) {
            const surveyResult = await db`
        SELECT s.survey_tags
        FROM responses r
        JOIN surveys s ON r.survey_id = s.id
        WHERE r.id = ${params.responseId}
        AND s.creator_id = ${userId}
      `;

            if (surveyResult.length === 0) {
                return createApiError('NOT_FOUND', 'Response not found', 404);
            }

            const surveyTags = surveyResult[0].survey_tags || [];
            const invalidTags = tags.filter((tag: string) => !surveyTags.includes(tag));

            if (invalidTags.length > 0) {
                return createApiError('VALIDATION_ERROR', 'Invalid tags', 400, {
                    field: 'tags',
                    issue: 'Response tags must be a subset of survey tags',
                    invalid_tags: invalidTags,
                    valid_tags: surveyTags
                });
            }
        }

        // Update response analysis
        const responses = await db`
      UPDATE responses
      SET 
        summary = COALESCE(${summary || null}, summary),
        summary_generated_at = CASE WHEN ${summary || null} IS NOT NULL THEN CURRENT_TIMESTAMP ELSE summary_generated_at END,
        tags = COALESCE(${tags || null}, tags),
        insight_level = COALESCE(${insight_level !== undefined ? parseInt(insight_level, 10) : null}, insight_level),
        insight_explanation = COALESCE(${insight_explanation || null}, insight_explanation),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.responseId}
      AND survey_id IN (
        SELECT id FROM surveys WHERE creator_id = ${userId}
      )
      RETURNING *
    `;

        if (responses.length === 0) {
            return createApiError('NOT_FOUND', 'Response not found', 404);
        }

        const response = responses[0];

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
        console.error('Error updating response analysis:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 