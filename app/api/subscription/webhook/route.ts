import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature')!;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (!userId) {
                    throw new Error('No userId in session metadata');
                }

                // Update subscription in database
                await db`
          INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id)
          VALUES (${userId}, 'pro', 'active', ${session.subscription})
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            plan = 'pro',
            status = 'active',
            stripe_subscription_id = ${session.subscription},
            updated_at = CURRENT_TIMESTAMP
        `;
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