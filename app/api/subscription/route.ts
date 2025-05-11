import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth0';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        const user = session?.user;

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // First get the user's UUID from the users table
        const userResult = await db`
            SELECT id FROM users 
            WHERE auth0_id = ${user.sub}
        `;

        if (!userResult?.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userUuid = userResult[0].id;

        // Get the subscription
        const subscriptionResult = await db`
            SELECT plan, status 
            FROM subscriptions 
            WHERE user_id = ${userUuid}
        `;

        return NextResponse.json({
            subscription: subscriptionResult[0] || { plan: 'free', status: 'active' }
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { plan, userId } = await request.json();

        // Validate plan
        if (!['free', 'pro', 'enterprise'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // First get the user's UUID from the users table
        const userResult = await db`
            SELECT id FROM users 
            WHERE auth0_id = ${userId}
        `;

        if (!userResult?.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userUuid = userResult[0].id;

        // Create or update subscription
        const result = await db`
            INSERT INTO subscriptions (user_id, plan, status)
            VALUES (${userUuid}, ${plan}, 'active')
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                plan = ${plan},
                status = 'active',
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            subscription: result[0]
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // For now, just return success
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 