import { auth0 } from '@/lib/auth0-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    // Handle logout specifically
    if (request.nextUrl.pathname === '/api/auth/logout') {
        const logoutUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
        logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
        logoutUrl.searchParams.set('returnTo', new URL('/', request.url).toString());
        logoutUrl.searchParams.set('federated', 'true');
        return NextResponse.redirect(logoutUrl, { status: 302 });
    }

    // Handle other auth routes
    const response = await auth0.middleware(request);
    if (response.headers.get('location')) {
        return response;
    }
    return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
    const response = await auth0.middleware(request);
    if (response.headers.get('location')) {
        return response;
    }
    return new NextResponse(null, { status: 200 });
} 