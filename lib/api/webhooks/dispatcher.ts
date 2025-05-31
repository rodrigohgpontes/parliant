import crypto from 'crypto';
import { db } from '@/lib/db';

export interface WebhookEvent {
    type: string;
    created_at: string;
    data: any;
}

export interface WebhookPayload {
    id: string;
    type: string;
    created_at: string;
    data: any;
}

// Generate HMAC signature for webhook security
function generateSignature(payload: string, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
}

// Send webhook with retries
async function sendWebhook(url: string, payload: WebhookPayload, secret: string): Promise<boolean> {
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString, secret);

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Id': payload.id,
                    'X-Webhook-Timestamp': payload.created_at,
                },
                body: payloadString,
                signal: AbortSignal.timeout(10000), // 10 second timeout
            });

            if (response.ok) {
                return true;
            }

            // Don't retry client errors (4xx)
            if (response.status >= 400 && response.status < 500) {
                console.error(`Webhook failed with client error: ${response.status}`);
                return false;
            }

            // Retry server errors (5xx)
            attempt++;
            if (attempt < maxRetries) {
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        } catch (error) {
            console.error(`Webhook delivery error:`, error);
            attempt++;
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    return false;
}

// Log webhook delivery attempt
async function logWebhookDelivery(
    webhookId: string,
    eventId: string,
    success: boolean,
    statusCode?: number,
    error?: string
) {
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

        // Log the delivery attempt
        await db`
      INSERT INTO webhook_deliveries (
        webhook_id,
        event_id,
        success,
        status_code,
        error
      ) VALUES (
        ${webhookId},
        ${eventId},
        ${success},
        ${statusCode || null},
        ${error || null}
      )
    `;
    } catch (err) {
        console.error('Failed to log webhook delivery:', err);
    }
}

// Main function to dispatch webhook events
export async function dispatchWebhookEvent(
    userId: string,
    event: WebhookEvent
) {
    try {
        // Get active webhooks for this user that subscribe to this event type
        const webhooks = await db`
      SELECT id, url, secret
      FROM webhooks
      WHERE user_id = ${userId}
      AND active = true
      AND ${event.type} = ANY(events)
    `;

        if (webhooks.length === 0) {
            return;
        }

        // Create webhook payload
        const payload: WebhookPayload = {
            id: crypto.randomUUID(),
            type: event.type,
            created_at: new Date().toISOString(),
            data: event.data,
        };

        // Send webhooks in parallel
        const deliveryPromises = webhooks.map(async (webhook: any) => {
            const success = await sendWebhook(webhook.url, payload, webhook.secret);
            await logWebhookDelivery(webhook.id, payload.id, success);
            return { webhookId: webhook.id, success };
        });

        const results = await Promise.allSettled(deliveryPromises);

        // Log results
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Webhook ${webhooks[index].id} delivery: ${result.value.success ? 'success' : 'failed'}`);
            } else {
                console.error(`Webhook ${webhooks[index].id} delivery error:`, result.reason);
            }
        });
    } catch (error) {
        console.error('Error dispatching webhook event:', error);
    }
}

// Helper functions for specific events
export async function dispatchSurveyCreated(userId: string, survey: any) {
    await dispatchWebhookEvent(userId, {
        type: 'survey.created',
        created_at: new Date().toISOString(),
        data: {
            survey: {
                id: survey.id,
                objective: survey.objective,
                created_at: survey.created_at,
            }
        }
    });
}

export async function dispatchSurveyUpdated(userId: string, survey: any, changes: any) {
    await dispatchWebhookEvent(userId, {
        type: 'survey.updated',
        created_at: new Date().toISOString(),
        data: {
            survey: {
                id: survey.id,
                objective: survey.objective,
                updated_at: survey.updated_at,
            },
            changes
        }
    });
}

export async function dispatchResponseSubmitted(userId: string, response: any, survey: any) {
    await dispatchWebhookEvent(userId, {
        type: 'response.submitted',
        created_at: new Date().toISOString(),
        data: {
            response: {
                id: response.id,
                survey_id: response.survey_id,
                respondent_email: response.respondent_email,
                completed_at: response.completed_at,
            },
            survey: {
                id: survey.id,
                objective: survey.objective,
            }
        }
    });
} 