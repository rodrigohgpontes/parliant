import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth0';
import { createOrUpdateUser } from '@/lib/actions/user-actions';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch latest user data from Auth0 Management API
        const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${session.user.sub}`, {
            headers: {
                'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Error fetching user profile from Auth0:', await response.text());
            return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
        }

        const updatedUserData = await response.json();

        // Update our database with the latest data
        await createOrUpdateUser(updatedUserData);

        return NextResponse.json({
            email_verified: updatedUserData.email_verified,
            email: updatedUserData.email
        });
    } catch (error) {
        console.error('Error checking verification status:', error);
        return NextResponse.json({ error: 'Failed to check verification status' }, { status: 500 });
    }
}
