import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth0';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        const user = session?.user;

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get user's UUID from the users table
        const userResult = await db`
      SELECT id, email FROM users 
      WHERE auth0_id = ${user.sub}
    `;

        if (!userResult?.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userUuid = userResult[0].id;
        const userEmail = userResult[0].email;

        // Create a Stripe checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product: process.env.STRIPE_PRO_PRODUCT_ID,
                        recurring: {
                            interval: 'month',
                        },
                        unit_amount: 4900, // $49.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${request.headers.get('origin')}/subscription?success=true`,
            cancel_url: `${request.headers.get('origin')}/subscription?canceled=true`,
            metadata: {
                userId: userUuid,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 