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
    if (!hasScope(apiUser.scope, 'analytics:read')) {
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
      SELECT * FROM surveys
      WHERE id = ${params.surveyId}
      AND creator_id = ${userId}
    `;

        if (surveys.length === 0) {
            return createApiError('NOT_FOUND', 'Survey not found', 404);
        }

        const survey = surveys[0];

        // Get total responses
        const totalResponsesResult = await db`
      SELECT COUNT(*) FROM responses
      WHERE survey_id = ${params.surveyId}
      AND deleted_at IS NULL
    `;
        const totalResponses = parseInt(totalResponsesResult[0].count, 10);

        // Get completion rate (assuming all submitted responses are complete)
        const completionRate = 1.0; // In a real app, you might track partial vs complete responses

        // Get average insight level
        const avgInsightResult = await db`
      SELECT AVG(insight_level) as avg_insight
      FROM responses
      WHERE survey_id = ${params.surveyId}
      AND deleted_at IS NULL
      AND insight_level IS NOT NULL
    `;
        const averageInsightLevel = parseFloat(avgInsightResult[0].avg_insight || '0');

        // Get response trends (last 30 days)
        const responseTrends = await db`
      SELECT 
        DATE(completed_at) as date,
        COUNT(*) as count
      FROM responses
      WHERE survey_id = ${params.surveyId}
      AND deleted_at IS NULL
      AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(completed_at)
      ORDER BY date
    `;

        // Get tag distribution
        const tagDistribution = await db`
      SELECT 
        unnest(tags) as tag,
        COUNT(*) as count
      FROM responses
      WHERE survey_id = ${params.surveyId}
      AND deleted_at IS NULL
      AND tags IS NOT NULL
      GROUP BY tag
      ORDER BY count DESC
    `;

        // Get sentiment analysis (simplified - based on insight levels)
        const sentimentResult = await db`
      SELECT 
        CASE 
          WHEN insight_level >= 8 THEN 'positive'
          WHEN insight_level >= 5 THEN 'neutral'
          WHEN insight_level > 0 THEN 'negative'
          ELSE 'unknown'
        END as sentiment,
        COUNT(*) as count
      FROM responses
      WHERE survey_id = ${params.surveyId}
      AND deleted_at IS NULL
      GROUP BY sentiment
    `;

        // Convert to sentiment object
        const sentimentAnalysis = sentimentResult.reduce((acc: any, row: any) => {
            acc[row.sentiment] = parseInt(row.count, 10);
            return acc;
        }, {
            positive: 0,
            neutral: 0,
            negative: 0,
            unknown: 0
        });

        // Format response
        const response = NextResponse.json({
            data: {
                type: 'survey_analytics',
                attributes: {
                    survey_id: params.surveyId,
                    total_responses: totalResponses,
                    completion_rate: completionRate,
                    average_insight_level: averageInsightLevel,
                    response_trends: responseTrends.map((trend: any) => ({
                        date: trend.date,
                        count: parseInt(trend.count, 10)
                    })),
                    tag_distribution: tagDistribution.reduce((acc: any, item: any) => {
                        acc[item.tag] = parseInt(item.count, 10);
                        return acc;
                    }, {}),
                    sentiment_analysis: sentimentAnalysis,
                    survey_info: {
                        objective: survey.objective,
                        is_active: survey.is_active,
                        created_at: survey.created_at,
                        end_date: survey.end_date
                    }
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error fetching survey analytics:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 