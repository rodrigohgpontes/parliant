import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    try {
        // Get the raw body as text
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            console.error('No stripe-signature header found');
            return NextResponse.json({ error: 'No signature found' }, { status: 400 });
        }

        if (!webhookSecret) {
            console.error('No webhook secret configured');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        console.log('Webhook event type:', event.type);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.user_id; // Fixed: use 'user_id' instead of 'userId'
                const planName = 'pro'; // Always use 'pro' since there's only one Stripe product: "Parliant Pro"

                console.log('Processing checkout.session.completed:', {
                    sessionId: session.id,
                    userId,
                    planName,
                    metadata: session.metadata
                });

                // For test events, we'll use a test user ID
                if (!userId && process.env.NODE_ENV === 'development') {
                    console.log('Test event detected, using test user ID');
                    // Get the first user from the database for testing
                    const testUser = await db`
                        SELECT id FROM users LIMIT 1
                    `;

                    if (!testUser?.length) {
                        console.error('No test user found in database');
                        return NextResponse.json({ error: 'No test user available' }, { status: 500 });
                    }

                    // Update subscription in database with test user
                    await db`
                        INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id)
                        VALUES (${testUser[0].id}, ${planName}, 'active', ${session.subscription})
                        ON CONFLICT (user_id) 
                        DO UPDATE SET 
                            plan = ${planName},
                            status = 'active',
                            stripe_subscription_id = ${session.subscription},
                            updated_at = CURRENT_TIMESTAMP
                    `;
                } else if (!userId) {
                    console.error('No user_id in session metadata and not in development mode', {
                        metadata: session.metadata,
                        sessionId: session.id
                    });
                    return NextResponse.json({ error: 'No user_id in session metadata' }, { status: 400 });
                } else {
                    // Update subscription in database with real user
                    console.log('Updating subscription for user:', userId, 'with plan:', planName);
                    await db`
                        INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id)
                        VALUES (${userId}, ${planName}, 'active', ${session.subscription})
                        ON CONFLICT (user_id) 
                        DO UPDATE SET 
                            plan = ${planName},
                            status = 'active',
                            stripe_subscription_id = ${session.subscription},
                            updated_at = CURRENT_TIMESTAMP
                    `;
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // Update subscription in database
                await db`
                    UPDATE subscriptions 
                    SET 
                        plan = 'free',
                        status = 'canceled',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE stripe_subscription_id = ${subscription.id}
                `;
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 