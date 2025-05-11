import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth0';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        if (!process.env.AUTH0_MANAGEMENT_API_TOKEN) {
            console.error('AUTH0_MANAGEMENT_API_TOKEN is not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (!process.env.AUTH0_DOMAIN) {
            console.error('AUTH0_DOMAIN is not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${session.user.sub}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching user profile:', errorText);
            throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
        }

        const userProfile = await response.json();
        return NextResponse.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
} 