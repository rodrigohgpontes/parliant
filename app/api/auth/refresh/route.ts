import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0-client';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Force a session refresh by calling Auth0's token endpoint
        const response = await auth0.middleware(request);
        if (response.headers.get('location')) {
            return response;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error refreshing session:', error);
        return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
    }
} 