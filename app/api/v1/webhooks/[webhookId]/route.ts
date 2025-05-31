import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: { webhookId: string; }; }
) {
    // Validate token
    const apiUser = await validateApiToken(req);
    if (!apiUser) {
        return createApiError('AUTHENTICATION_ERROR', 'Invalid or missing access token', 401);
    }

    // Check scope
    if (!hasScope(apiUser.scope, 'webhooks:write')) {
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

        // Get webhook
        const webhooks = await db`
      SELECT * FROM webhooks
      WHERE id = ${params.webhookId}
      AND user_id = ${userId}
    `;

        if (webhooks.length === 0) {
            return createApiError('NOT_FOUND', 'Webhook not found', 404);
        }

        const webhook = webhooks[0];

        // Format response (without secret)
        const response = NextResponse.json({
            data: {
                id: webhook.id,
                type: 'webhook',
                attributes: {
                    url: webhook.url,
                    events: webhook.events,
                    active: webhook.active,
                    created_at: webhook.created_at,
                    updated_at: webhook.updated_at,
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error fetching webhook:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { webhookId: string; }; }
) {
    // Validate token
    const apiUser = await validateApiToken(req);
    if (!apiUser) {
        return createApiError('AUTHENTICATION_ERROR', 'Invalid or missing access token', 401);
    }

    // Check scope
    if (!hasScope(apiUser.scope, 'webhooks:write')) {
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
        const { url, events, active } = body;

        // Validate URL if provided
        if (url !== undefined) {
            try {
                new URL(url);
            } catch (e) {
                return createApiError('VALIDATION_ERROR', 'Invalid URL format', 400, {
                    field: 'url',
                    issue: 'Must be a valid URL'
                });
            }
        }

        // Validate events if provided
        if (events !== undefined) {
            if (!Array.isArray(events) || events.length === 0) {
                return createApiError('VALIDATION_ERROR', 'Invalid events', 400, {
                    field: 'events',
                    issue: 'Must be a non-empty array of event types'
                });
            }

            const VALID_EVENTS = [
                'survey.created',
                'survey.updated',
                'survey.archived',
                'response.submitted',
                'response.analyzed',
                'response.updated',
                'subscription.changed'
            ];

            const invalidEvents = events.filter((event: string) => !VALID_EVENTS.includes(event));
            if (invalidEvents.length > 0) {
                return createApiError('VALIDATION_ERROR', 'Invalid events', 400, {
                    field: 'events',
                    issue: 'Contains invalid event types',
                    invalid_events: invalidEvents,
                    valid_events: VALID_EVENTS
                });
            }
        }

        // Update webhook
        const webhooks = await db`
      UPDATE webhooks
      SET 
        url = COALESCE(${url || null}, url),
        events = COALESCE(${events || null}, events),
        active = COALESCE(${active ?? null}, active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.webhookId}
      AND user_id = ${userId}
      RETURNING *
    `;

        if (webhooks.length === 0) {
            return createApiError('NOT_FOUND', 'Webhook not found', 404);
        }

        const webhook = webhooks[0];

        // Format response (without secret)
        const response = NextResponse.json({
            data: {
                id: webhook.id,
                type: 'webhook',
                attributes: {
                    url: webhook.url,
                    events: webhook.events,
                    active: webhook.active,
                    created_at: webhook.created_at,
                    updated_at: webhook.updated_at,
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error updating webhook:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { webhookId: string; }; }
) {
    // Validate token
    const apiUser = await validateApiToken(req);
    if (!apiUser) {
        return createApiError('AUTHENTICATION_ERROR', 'Invalid or missing access token', 401);
    }

    // Check scope
    if (!hasScope(apiUser.scope, 'webhooks:write')) {
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

        // Delete webhook
        const result = await db`
      DELETE FROM webhooks
      WHERE id = ${params.webhookId}
      AND user_id = ${userId}
      RETURNING id
    `;

        if (result.length === 0) {
            return createApiError('NOT_FOUND', 'Webhook not found', 404);
        }

        // Return 204 No Content
        const response = new NextResponse(null, { status: 204 });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error deleting webhook:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 