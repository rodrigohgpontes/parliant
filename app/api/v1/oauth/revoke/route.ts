import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const contentType = req.headers.get('content-type');

    let body: any;
    if (contentType?.includes('application/x-www-form-urlencoded')) {
        const text = await req.text();
        body = Object.fromEntries(new URLSearchParams(text));
    } else {
        body = await req.json();
    }

    const { token, token_type_hint, client_id, client_secret } = body;

    // Validate client credentials
    if (!client_id || !client_secret) {
        return NextResponse.json(
            {
                error: 'invalid_client',
                error_description: 'Client authentication failed'
            },
            { status: 401 }
        );
    }

    // Validate token
    if (!token) {
        return NextResponse.json(
            {
                error: 'invalid_request',
                error_description: 'Missing token parameter'
            },
            { status: 400 }
        );
    }

    try {
        // In a production environment, you would:
        // 1. Validate the client credentials against your database
        // 2. Check if the token belongs to this client
        // 3. Invalidate the token in your token store (Redis, database, etc.)

        // For Auth0, you might need to call their revocation endpoint
        // However, Auth0 doesn't support token revocation for some token types
        // Access tokens are typically short-lived and don't need revocation

        // If using refresh tokens, you can revoke them through Auth0's API
        if (token_type_hint === 'refresh_token') {
            // Call Auth0's revocation endpoint
            const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/revoke`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: process.env.AUTH0_M2M_CLIENT_ID,
                    client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
                    token,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return NextResponse.json(error, { status: response.status });
            }
        }

        // Success - return 200 OK with no body
        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error('Error revoking token:', error);
        return NextResponse.json(
            {
                error: 'server_error',
                error_description: 'Failed to revoke token'
            },
            { status: 500 }
        );
    }
} 