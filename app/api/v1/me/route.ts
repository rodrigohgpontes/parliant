import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    // Validate token
    const apiUser = await validateApiToken(req);
    if (!apiUser) {
        return createApiError('AUTHENTICATION_ERROR', 'Invalid or missing access token', 401);
    }

    // Check scope
    if (!hasScope(apiUser.scope, 'profile:read')) {
        return createApiError('AUTHORIZATION_ERROR', 'Insufficient scope', 403);
    }

    // Get user tier and check rate limit
    const userTier = await getUserTier(apiUser.sub);
    const rateLimitResponse = await rateLimitMiddleware(req, apiUser.azp, userTier);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        // Get user from database
        const users = await db`
      SELECT 
        u.id,
        u.auth0_id,
        u.email,
        u.name,
        u.plan,
        u.is_email_verified,
        u.created_at,
        u.updated_at,
        s.status as subscription_status,
        s.stripe_subscription_id,
        s.will_cancel_at_period_end
      FROM users u
      LEFT JOIN subscriptions s ON u.auth0_id = s.user_id
      WHERE u.auth0_id = ${apiUser.sub}
    `;

        if (users.length === 0) {
            return createApiError('NOT_FOUND', 'User not found', 404);
        }

        const user = users[0];

        // Format response
        const response = NextResponse.json({
            data: {
                id: user.id,
                type: 'user',
                attributes: {
                    email: user.email,
                    name: user.name,
                    plan: user.plan,
                    is_email_verified: user.is_email_verified,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                },
                relationships: {
                    subscription: user.subscription_status ? {
                        data: {
                            type: 'subscription',
                            attributes: {
                                status: user.subscription_status,
                                stripe_subscription_id: user.stripe_subscription_id,
                                will_cancel_at_period_end: user.will_cancel_at_period_end,
                            }
                        }
                    } : null
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error fetching user:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
}

export async function PATCH(req: NextRequest) {
    // Validate token
    const apiUser = await validateApiToken(req);
    if (!apiUser) {
        return createApiError('AUTHENTICATION_ERROR', 'Invalid or missing access token', 401);
    }

    // Check scope
    if (!hasScope(apiUser.scope, 'profile:read')) {
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
        const { name, preferences } = body;

        // Update user
        const users = await db`
      UPDATE users
      SET 
        name = COALESCE(${name}, name),
        updated_at = CURRENT_TIMESTAMP
      WHERE auth0_id = ${apiUser.sub}
      RETURNING *
    `;

        if (users.length === 0) {
            return createApiError('NOT_FOUND', 'User not found', 404);
        }

        const user = users[0];

        // Format response
        const response = NextResponse.json({
            data: {
                id: user.id,
                type: 'user',
                attributes: {
                    email: user.email,
                    name: user.name,
                    plan: user.plan,
                    is_email_verified: user.is_email_verified,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error updating user:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 