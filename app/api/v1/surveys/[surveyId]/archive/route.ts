import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';

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
    if (!hasScope(apiUser.scope, 'surveys:write')) {
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

        // Archive survey by setting is_active to false
        const surveys = await db`
      UPDATE surveys
      SET 
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.surveyId}
      AND creator_id = ${userId}
      RETURNING *
    `;

        if (surveys.length === 0) {
            return createApiError('NOT_FOUND', 'Survey not found', 404);
        }

        const survey = surveys[0];

        // Format response
        const response = NextResponse.json({
            data: {
                id: survey.id,
                type: 'survey',
                attributes: {
                    objective: survey.objective,
                    orientations: survey.orientations,
                    is_active: survey.is_active,
                    allow_anonymous: survey.allow_anonymous,
                    is_one_per_respondent: survey.is_one_per_respondent,
                    end_date: survey.end_date,
                    max_questions: survey.max_questions,
                    max_characters: survey.max_characters,
                    survey_summary: survey.survey_summary,
                    survey_tags: survey.survey_tags,
                    first_question: survey.first_question,
                    created_at: survey.created_at,
                    updated_at: survey.updated_at,
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error archiving survey:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 