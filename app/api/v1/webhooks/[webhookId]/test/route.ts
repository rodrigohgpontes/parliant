import { NextRequest, NextResponse } from 'next/server';
import { validateApiToken, hasScope, createApiError } from '@/lib/api/middleware/auth';
import { rateLimitMiddleware, checkRateLimit, addRateLimitHeaders, getUserTier } from '@/lib/api/middleware/rate-limit';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Generate HMAC signature for webhook security
function generateSignature(payload: string, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
}

export async function POST(
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

        // Create test payload
        const testPayload = {
            id: crypto.randomUUID(),
            type: 'webhook.test',
            created_at: new Date().toISOString(),
            data: {
                message: 'This is a test webhook event',
                webhook_id: webhook.id,
                events: webhook.events,
            }
        };

        const payloadString = JSON.stringify(testPayload);
        const signature = generateSignature(payloadString, webhook.secret);

        // Send test webhook
        let success = false;
        let statusCode: number | undefined;
        let error: string | undefined;
        let responseBody: string | undefined;

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Id': testPayload.id,
                    'X-Webhook-Timestamp': testPayload.created_at,
                },
                body: payloadString,
                signal: AbortSignal.timeout(10000), // 10 second timeout
            });

            statusCode = response.status;
            success = response.ok;

            try {
                responseBody = await response.text();
            } catch (e) {
                responseBody = 'Unable to read response body';
            }

            if (!success) {
                error = `HTTP ${statusCode}: ${response.statusText}`;
            }
        } catch (err: any) {
            success = false;
            error = err.message || 'Unknown error';
        }

        // Log test attempt
        try {
            // Create webhook_deliveries table if not exists
            await db`
        CREATE TABLE IF NOT EXISTS webhook_deliveries (
          id uuid NOT NULL DEFAULT uuid_generate_v4(),
          webhook_id uuid NOT NULL,
          event_id text NOT NULL,
          success boolean NOT NULL,
          status_code integer,
          error text,
          attempted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
        )
      `;

            // Log the test delivery
            await db`
        INSERT INTO webhook_deliveries (
          webhook_id,
          event_id,
          success,
          status_code,
          error
        ) VALUES (
          ${params.webhookId},
          ${testPayload.id},
          ${success},
          ${statusCode || null},
          ${error || null}
        )
      `;
        } catch (logErr) {
            console.error('Failed to log test webhook delivery:', logErr);
        }

        // Format response
        const response = NextResponse.json({
            data: {
                id: testPayload.id,
                type: 'webhook_test',
                attributes: {
                    success,
                    status_code: statusCode,
                    error,
                    response_body: responseBody?.substring(0, 500), // Limit response body length
                    tested_at: testPayload.created_at,
                    webhook: {
                        id: webhook.id,
                        url: webhook.url,
                        active: webhook.active,
                    }
                }
            }
        });

        // Add rate limit headers
        const rateLimitInfo = await checkRateLimit(apiUser.azp, userTier);
        return addRateLimitHeaders(response, rateLimitInfo);
    } catch (error) {
        console.error('Error testing webhook:', error);
        return createApiError('SERVER_ERROR', 'Internal server error', 500);
    }
} 