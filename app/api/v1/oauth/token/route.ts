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

    const { grant_type, code, client_id, client_secret, redirect_uri, refresh_token } = body;

    // Validate client credentials
    // In production, this should validate against a database of registered OAuth clients
    if (!client_id || !client_secret) {
        return NextResponse.json(
            {
                error: 'invalid_client',
                error_description: 'Client authentication failed'
            },
            { status: 401 }
        );
    }

    if (grant_type === 'authorization_code') {
        if (!code || !redirect_uri) {
            return NextResponse.json(
                {
                    error: 'invalid_request',
                    error_description: 'Missing required parameters'
                },
                { status: 400 }
            );
        }

        // Exchange authorization code for tokens with Auth0
        try {
            const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: process.env.AUTH0_M2M_CLIENT_ID,
                    client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
                    code,
                    redirect_uri: `${process.env.APP_BASE_URL}/api/v1/oauth/callback`,
                }),
            });

            if (!tokenResponse.ok) {
                const error = await tokenResponse.json();
                return NextResponse.json(error, { status: tokenResponse.status });
            }

            const tokens = await tokenResponse.json();

            // Return tokens to the client
            return NextResponse.json({
                access_token: tokens.access_token,
                token_type: 'Bearer',
                expires_in: tokens.expires_in,
                refresh_token: tokens.refresh_token,
                scope: tokens.scope,
            });
        } catch (error) {
            return NextResponse.json(
                {
                    error: 'server_error',
                    error_description: 'Failed to exchange authorization code'
                },
                { status: 500 }
            );
        }
    } else if (grant_type === 'refresh_token') {
        if (!refresh_token) {
            return NextResponse.json(
                {
                    error: 'invalid_request',
                    error_description: 'Missing refresh token'
                },
                { status: 400 }
            );
        }

        // Exchange refresh token for new access token
        try {
            const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'refresh_token',
                    client_id: process.env.AUTH0_M2M_CLIENT_ID,
                    client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
                    refresh_token,
                }),
            });

            if (!tokenResponse.ok) {
                const error = await tokenResponse.json();
                return NextResponse.json(error, { status: tokenResponse.status });
            }

            const tokens = await tokenResponse.json();

            return NextResponse.json({
                access_token: tokens.access_token,
                token_type: 'Bearer',
                expires_in: tokens.expires_in,
                refresh_token: tokens.refresh_token,
                scope: tokens.scope,
            });
        } catch (error) {
            return NextResponse.json(
                {
                    error: 'server_error',
                    error_description: 'Failed to refresh token'
                },
                { status: 500 }
            );
        }
    } else {
        return NextResponse.json(
            {
                error: 'unsupported_grant_type',
                error_description: 'Grant type not supported'
            },
            { status: 400 }
        );
    }
} 