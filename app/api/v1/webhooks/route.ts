import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';
import crypto from 'crypto';

// First, let's create the webhooks table
// In production, this would be in a migration file
const createWebhooksTableIfNotExists = async () => {
    try {
        await db`
      CREATE TABLE IF NOT EXISTS webhooks (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL,
        url text NOT NULL,
        events text[] NOT NULL,
        active boolean DEFAULT true,
        secret text NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    } catch (error) {
        // Table might already exist
        console.log('Webhooks table creation:', error);
    }
};

// Valid webhook events
const VALID_EVENTS = [
    'survey.created',
    'survey.updated',
    'survey.archived',
    'response.submitted',
    'response.analyzed',
    'response.updated',
    'subscription.changed'
];

export async function GET(req: NextRequest) {
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
        await createWebhooksTableIfNotExists();

        // Get user ID from auth0_id
        const users = await db`SELECT id FROM users WHERE auth0_id = ${apiUser.sub}`;
        if (users.length === 0) {
            return createApiError('NOT_FOUND', 'User not found', 404);
        }
        const userId = users[0].id;

        // Get webhooks
        const webhooks = await db`
      SELECT * FROM webhooks
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

        // Format webhooks
        const formattedWebhooks = webhooks.map((webhook: any) => ({
            id: webhook.id,
            type: 'webhook',
            attributes: {
                url: webhook.url,
                events: webhook.events,
                active: webhook.active,
                created_at: webhook.created_at,
                updated_at: webhook.updated_at,
            }
        }));

        const response = NextResponse.json({
            data: formattedWebhooks
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error fetching webhooks:', error);
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
        await createWebhooksTableIfNotExists();

        // Get user ID from auth0_id
        const users = await db`SELECT id FROM users WHERE auth0_id = ${apiUser.sub}`;
        if (users.length === 0) {
            return createApiError('NOT_FOUND', 'User not found', 404);
        }
        const userId = users[0].id;

        const body = await req.json();
        const {
            url,
            events,
            active = true,
            secret = crypto.randomBytes(32).toString('hex')
        } = body;

        // Validate required fields
        if (!url) {
            return createApiError('VALIDATION_ERROR', 'Missing required field: url', 400, {
                field: 'url',
                issue: 'Required field'
            });
        }

        if (!events || !Array.isArray(events) || events.length === 0) {
            return createApiError('VALIDATION_ERROR', 'Invalid events', 400, {
                field: 'events',
                issue: 'Must be a non-empty array of event types'
            });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            return createApiError('VALIDATION_ERROR', 'Invalid URL format', 400, {
                field: 'url',
                issue: 'Must be a valid URL'
            });
        }

        // Validate events
        const invalidEvents = events.filter((event: string) => !VALID_EVENTS.includes(event));
        if (invalidEvents.length > 0) {
            return createApiError('VALIDATION_ERROR', 'Invalid events', 400, {
                field: 'events',
                issue: 'Contains invalid event types',
                invalid_events: invalidEvents,
                valid_events: VALID_EVENTS
            });
        }

        // Check webhook limit (e.g., 10 per user)
        const existingCount = await db`
      SELECT COUNT(*) FROM webhooks
      WHERE user_id = ${userId}
    `;

        if (parseInt(existingCount[0].count, 10) >= 10) {
            return createApiError('VALIDATION_ERROR', 'Webhook limit reached', 400, {
                message: 'Maximum 10 webhooks allowed per user'
            });
        }

        // Create webhook
        const webhooks = await db`
      INSERT INTO webhooks (
        user_id,
        url,
        events,
        active,
        secret
      ) VALUES (
        ${userId},
        ${url},
        ${events},
        ${active},
        ${secret}
      ) RETURNING *
    `;

        const webhook = webhooks[0];

        // Format response
        const response = NextResponse.json({
            data: {
                id: webhook.id,
                type: 'webhook',
                attributes: {
                    url: webhook.url,
                    events: webhook.events,
                    active: webhook.active,
                    secret: webhook.secret, // Only returned on creation
                    created_at: webhook.created_at,
                    updated_at: webhook.updated_at,
                }
            }
        }, { status: 201 });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error creating webhook:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 