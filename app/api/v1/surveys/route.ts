import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { getPaginationParams, createPaginatedResponse } from '@/lib/api/utils/pagination';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
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

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const { page = 1, limit = 20 } = getPaginationParams(searchParams);
        const offset = (page - 1) * limit;

        // Build filters
        const filters: any = { creator_id: userId };

        const isActive = searchParams.get('is_active');
        if (isActive !== null) {
            filters.is_active = isActive === 'true';
        }

        const createdAfter = searchParams.get('created_after');
        if (createdAfter) {
            filters.created_after = new Date(createdAfter);
        }

        const createdBefore = searchParams.get('created_before');
        if (createdBefore) {
            filters.created_before = new Date(createdBefore);
        }

        const tags = searchParams.get('tags');
        const tagArray = tags ? tags.split(',') : null;

        // Get total count - simplified approach for Neon
        let countResult;
        if (tagArray && filters.created_after && filters.created_before) {
            countResult = await db`
                SELECT COUNT(*) FROM surveys
                WHERE creator_id = ${userId}
                AND is_active = ${filters.is_active ?? true}
                AND created_at >= ${filters.created_after}
                AND created_at <= ${filters.created_before}
                AND survey_tags && ${tagArray}
            `;
        } else if (filters.created_after && filters.created_before) {
            countResult = await db`
                SELECT COUNT(*) FROM surveys
                WHERE creator_id = ${userId}
                AND is_active = ${filters.is_active ?? true}
                AND created_at >= ${filters.created_after}
                AND created_at <= ${filters.created_before}
            `;
        } else if (tagArray) {
            countResult = await db`
                SELECT COUNT(*) FROM surveys
                WHERE creator_id = ${userId}
                AND is_active = ${filters.is_active ?? true}
                AND survey_tags && ${tagArray}
            `;
        } else if ('is_active' in filters) {
            countResult = await db`
                SELECT COUNT(*) FROM surveys
                WHERE creator_id = ${userId}
                AND is_active = ${filters.is_active}
            `;
        } else {
            countResult = await db`
                SELECT COUNT(*) FROM surveys
                WHERE creator_id = ${userId}
            `;
        }

        const total = parseInt(countResult[0].count, 10);

        // Get surveys - same approach
        let surveys;
        if (tagArray && filters.created_after && filters.created_before) {
            surveys = await db`
                SELECT * FROM surveys
                WHERE creator_id = ${userId}
                AND is_active = ${filters.is_active ?? true}
                AND created_at >= ${filters.created_after}
                AND created_at <= ${filters.created_before}
                AND survey_tags && ${tagArray}
                ORDER BY created_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else if (filters.created_after && filters.created_before) {
            surveys = await db`
                SELECT * FROM surveys
                WHERE creator_id = ${userId}
                AND is_active = ${filters.is_active ?? true}
                AND created_at >= ${filters.created_after}
                AND created_at <= ${filters.created_before}
                ORDER BY created_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else if (tagArray) {
            surveys = await db`
                SELECT * FROM surveys
                WHERE creator_id = ${userId}
                AND is_active = ${filters.is_active ?? true}
                AND survey_tags && ${tagArray}
                ORDER BY created_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else if ('is_active' in filters) {
            surveys = await db`
                SELECT * FROM surveys
                WHERE creator_id = ${userId}
                AND is_active = ${filters.is_active}
                ORDER BY created_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else {
            surveys = await db`
                SELECT * FROM surveys
                WHERE creator_id = ${userId}
                ORDER BY created_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        }

        // Format surveys
        const formattedSurveys = surveys.map((survey: any) => ({
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
        }));

        // Create paginated response
        const baseUrl = `${process.env.APP_BASE_URL}/api/v1/surveys`;
        const paginatedResponse = createPaginatedResponse(
            formattedSurveys,
            baseUrl,
            page,
            limit,
            total
        );

        const response = NextResponse.json(paginatedResponse);

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error fetching surveys:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
}

export async function POST(req: NextRequest) {
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
        const {
            objective,
            orientations,
            allow_anonymous = true,
            is_one_per_respondent = false,
            end_date,
            max_questions,
            max_characters,
            survey_tags,
            first_question,
            fixed_questions
        } = body;

        // Validate required fields
        if (!objective) {
            return createApiError('VALIDATION_ERROR', 'Missing required field: objective', 400, {
                field: 'objective',
                issue: 'Required field'
            });
        }

        // Create survey
        const surveys = await db`
      INSERT INTO surveys (
        creator_id,
        objective,
        orientations,
        allow_anonymous,
        is_one_per_respondent,
        end_date,
        max_questions,
        max_characters,
        survey_tags,
        first_question,
        fixed_questions
      ) VALUES (
        ${userId},
        ${objective},
        ${orientations},
        ${allow_anonymous},
        ${is_one_per_respondent},
        ${end_date || null},
        ${max_questions || null},
        ${max_characters || null},
        ${survey_tags || null},
        ${first_question || null},
        ${fixed_questions || null}
      ) RETURNING *
    `;

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
        }, { status: 201 });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error creating survey:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 