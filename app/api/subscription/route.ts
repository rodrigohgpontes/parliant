import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // For now, just return the free plan
        return NextResponse.json({
            subscription: { plan: 'free' }
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { plan } = await request.json();

        // For now, just return success
        return NextResponse.json({ success: true });
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