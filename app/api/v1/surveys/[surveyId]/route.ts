import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: { surveyId: string; }; }
) {
    // Validate token
    const apiUser = await validateApiToken(req);
    if (!apiUser) {
        return createApiError('AUTHENTICATION_ERROR', 'Invalid or missing access token', 401);
    }

    // Check scope
    if (!hasScope(apiUser.scope, 'surveys:read')) {
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

        // Get survey
        const surveys = await db`
      SELECT * FROM surveys
      WHERE id = ${params.surveyId}
      AND creator_id = ${userId}
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
                    fixed_questions: survey.fixed_questions,
                    created_at: survey.created_at,
                    updated_at: survey.updated_at,
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error fetching survey:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
}

export async function PATCH(
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

        const body = await req.json();

        // Update survey - using COALESCE for partial updates
        const surveys = await db`
      UPDATE surveys
      SET 
        objective = COALESCE(${body.objective || null}, objective),
        orientations = COALESCE(${body.orientations || null}, orientations),
        is_active = COALESCE(${body.is_active ?? null}, is_active),
        allow_anonymous = COALESCE(${body.allow_anonymous ?? null}, allow_anonymous),
        is_one_per_respondent = COALESCE(${body.is_one_per_respondent ?? null}, is_one_per_respondent),
        end_date = CASE WHEN ${body.end_date !== undefined} THEN ${body.end_date || null} ELSE end_date END,
        max_questions = CASE WHEN ${body.max_questions !== undefined} THEN ${body.max_questions || null} ELSE max_questions END,
        max_characters = CASE WHEN ${body.max_characters !== undefined} THEN ${body.max_characters || null} ELSE max_characters END,
        survey_tags = COALESCE(${body.survey_tags || null}, survey_tags),
        first_question = COALESCE(${body.first_question || null}, first_question),
        fixed_questions = COALESCE(${body.fixed_questions || null}, fixed_questions),
        survey_summary = COALESCE(${body.survey_summary || null}, survey_summary),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.surveyId} AND creator_id = ${userId}
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
                    fixed_questions: survey.fixed_questions,
                    created_at: survey.created_at,
                    updated_at: survey.updated_at,
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error updating survey:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
}

export async function DELETE(
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

        // Delete survey (cascade will handle responses)
        const result = await db`
      DELETE FROM surveys
      WHERE id = ${params.surveyId}
      AND creator_id = ${userId}
      RETURNING id
    `;

        if (result.length === 0) {
            return createApiError('NOT_FOUND', 'Survey not found', 404);
        }

        // Return 204 No Content
        const response = new NextResponse(null, { status: 204 });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error deleting survey:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 