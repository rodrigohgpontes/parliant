import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0-client';
import { db } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await auth0.getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.sub;

        // Get current subscription status
        const subscription = await db`
      SELECT * FROM subscriptions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

        return NextResponse.json({
            subscription: subscription[0] || { plan: 'free' }
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth0.getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.sub;
        const { plan } = await request.json();

        // Update or create subscription
        await db`
      INSERT INTO subscriptions (user_id, plan, status)
      VALUES (${userId}, ${plan}, 'active')
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        plan = ${plan},
        status = 'active',
        updated_at = NOW()
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth0.getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.sub;

        // Cancel subscription
        await db`
      UPDATE subscriptions 
      SET status = 'cancelled', updated_at = NOW()
      WHERE user_id = ${userId}
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 