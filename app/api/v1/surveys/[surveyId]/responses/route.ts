import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { getPaginationParams, createPaginatedResponse } from '@/lib/api/utils/pagination';
import { db } from '@/lib/db';
import { generateSummary } from '@/lib/actions/ai-actions';

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

        // Verify survey ownership
        const surveys = await db`
      SELECT id FROM surveys
      WHERE id = ${params.surveyId}
      AND creator_id = ${userId}
    `;

        if (surveys.length === 0) {
            return createApiError('NOT_FOUND', 'Survey not found', 404);
        }

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const { page = 1, limit = 20 } = getPaginationParams(searchParams);
        const offset = (page - 1) * limit;

        // Build filters
        const completedAfter = searchParams.get('completed_after');
        const completedBefore = searchParams.get('completed_before');
        const insightLevelMin = searchParams.get('insight_level_min');
        const tags = searchParams.get('tags');
        const tagArray = tags ? tags.split(',') : null;

        // Get total count - using Neon template literals
        let countResult;
        let responses;

        // Build query based on filters
        if (completedAfter && completedBefore && insightLevelMin && tagArray) {
            countResult = await db`
                SELECT COUNT(*) FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND completed_at >= ${new Date(completedAfter)}
                AND completed_at <= ${new Date(completedBefore)}
                AND insight_level >= ${parseInt(insightLevelMin, 10)}
                AND tags && ${tagArray}
            `;

            responses = await db`
                SELECT * FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND completed_at >= ${new Date(completedAfter)}
                AND completed_at <= ${new Date(completedBefore)}
                AND insight_level >= ${parseInt(insightLevelMin, 10)}
                AND tags && ${tagArray}
                ORDER BY completed_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else if (completedAfter && completedBefore && insightLevelMin) {
            countResult = await db`
                SELECT COUNT(*) FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND completed_at >= ${new Date(completedAfter)}
                AND completed_at <= ${new Date(completedBefore)}
                AND insight_level >= ${parseInt(insightLevelMin, 10)}
            `;

            responses = await db`
                SELECT * FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND completed_at >= ${new Date(completedAfter)}
                AND completed_at <= ${new Date(completedBefore)}
                AND insight_level >= ${parseInt(insightLevelMin, 10)}
                ORDER BY completed_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else if (completedAfter && completedBefore) {
            countResult = await db`
                SELECT COUNT(*) FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND completed_at >= ${new Date(completedAfter)}
                AND completed_at <= ${new Date(completedBefore)}
            `;

            responses = await db`
                SELECT * FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND completed_at >= ${new Date(completedAfter)}
                AND completed_at <= ${new Date(completedBefore)}
                ORDER BY completed_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else if (insightLevelMin) {
            countResult = await db`
                SELECT COUNT(*) FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND insight_level >= ${parseInt(insightLevelMin, 10)}
            `;

            responses = await db`
                SELECT * FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND insight_level >= ${parseInt(insightLevelMin, 10)}
                ORDER BY completed_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else if (tagArray) {
            countResult = await db`
                SELECT COUNT(*) FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND tags && ${tagArray}
            `;

            responses = await db`
                SELECT * FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                AND tags && ${tagArray}
                ORDER BY completed_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        } else {
            countResult = await db`
                SELECT COUNT(*) FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
            `;

            responses = await db`
                SELECT * FROM responses 
                WHERE survey_id = ${params.surveyId} 
                AND deleted_at IS NULL
                ORDER BY completed_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
        }

        const total = parseInt(countResult[0].count, 10);

        // Process responses and generate summaries if needed
        const processedResponses = await Promise.all(responses.map(async (response: any) => {
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

            return response;
        }));

        // Format responses
        const formattedResponses = processedResponses.map((response: any) => ({
            id: response.id,
            type: 'response',
            attributes: {
                respondent_email: response.respondent_email,
                respondent_name: response.respondent_name,
                conversation: response.conversation,
                summary: response.summary,
                summary_generated_at: response.summary_generated_at,
                tags: response.tags,
                insight_level: response.insight_level,
                insight_explanation: response.insight_explanation,
                completed_at: response.completed_at,
            }
        }));

        // Create paginated response
        const baseUrl = `${process.env.APP_BASE_URL}/api/v1/surveys/${params.surveyId}/responses`;
        const paginatedResponse = createPaginatedResponse(
            formattedResponses,
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
        console.error('Error fetching responses:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
}

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
        const body = await req.json();
        const {
            respondent_email,
            respondent_name,
            conversation
        } = body;

        // Validate required fields
        if (!conversation || typeof conversation !== 'object') {
            return createApiError('VALIDATION_ERROR', 'Invalid or missing conversation data', 400, {
                field: 'conversation',
                issue: 'Required field must be an object'
            });
        }

        // Verify survey exists and is active
        const surveys = await db`
      SELECT id, allow_anonymous, is_one_per_respondent
      FROM surveys
      WHERE id = ${params.surveyId}
      AND is_active = true
      AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP)
    `;

        if (surveys.length === 0) {
            return createApiError('NOT_FOUND', 'Survey not found or inactive', 404);
        }

        const survey = surveys[0];

        // Check anonymous response rules
        if (!survey.allow_anonymous && !respondent_email) {
            return createApiError('VALIDATION_ERROR', 'This survey requires an email address', 400, {
                field: 'respondent_email',
                issue: 'Required for non-anonymous surveys'
            });
        }

        // Check one-per-respondent rule
        if (survey.is_one_per_respondent && respondent_email) {
            const existingResponses = await db`
        SELECT id FROM responses
        WHERE survey_id = ${params.surveyId}
        AND respondent_email = ${respondent_email}
        AND deleted_at IS NULL
      `;

            if (existingResponses.length > 0) {
                return createApiError('VALIDATION_ERROR', 'You have already responded to this survey', 400, {
                    field: 'respondent_email',
                    issue: 'Duplicate response not allowed'
                });
            }
        }

        // Create response
        const responses = await db`
      INSERT INTO responses (
        survey_id,
        respondent_id,
        respondent_email,
        respondent_name,
        conversation
      ) VALUES (
        ${params.surveyId},
        ${apiUser.sub},
        ${respondent_email || null},
        ${respondent_name || null},
        ${conversation}
      ) RETURNING *
    `;

        const response = responses[0];

        // Format response
        const formattedResponse = NextResponse.json({
            data: {
                id: response.id,
                type: 'response',
                attributes: {
                    respondent_email: response.respondent_email,
                    respondent_name: response.respondent_name,
                    conversation: response.conversation,
                    summary: response.summary,
                    tags: response.tags,
                    insight_level: response.insight_level,
                    insight_explanation: response.insight_explanation,
                    completed_at: response.completed_at,
                }
            }
        }, { status: 201 });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(formattedResponse, rateLimitInfo);
    } catch (error) {
        console.error('Error creating response:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 