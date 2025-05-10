import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deleteAuth0User, auth0 } from '@/lib/auth0-client';
import { getSession } from '@/lib/auth0';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Handle auth routes using middleware
        const response = await auth0.middleware(request);
        if (response.headers.get('location')) {
            return response;
        }

        // Get the current user's session
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const auth0Id = session.user.sub;

        // Get the user's database ID
        const userResult = await db`
            SELECT id FROM users 
            WHERE auth0_id = ${auth0Id}
        `;

        if (!userResult?.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = userResult[0].id;

        // 1. Soft delete all responses
        await db`
            UPDATE responses
            SET deleted_at = NOW()
            WHERE survey_id IN (
                SELECT id FROM surveys WHERE creator_id = ${userId}
            )
        `;

        // 2. Soft delete all surveys
        await db`
            UPDATE surveys
            SET deleted_at = NOW()
            WHERE creator_id = ${userId}
        `;

        // 3. Soft delete the user account
        await db`
            UPDATE users
            SET deleted_at = NOW()
            WHERE id = ${userId}
        `;

        // 4. Delete the user from Auth0
        await deleteAuth0User(auth0Id);

        // Redirect to logout page
        return NextResponse.redirect(new URL('/auth/logout', request.url));
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 