import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const response_type = searchParams.get('response_type');
    const client_id = searchParams.get('client_id');
    const redirect_uri = searchParams.get('redirect_uri');
    const scope = searchParams.get('scope') || 'profile:read';
    const state = searchParams.get('state');

    // Validate required parameters
    if (!response_type || !client_id || !redirect_uri) {
        return NextResponse.json(
            {
                error: 'invalid_request',
                error_description: 'Missing required parameters'
            },
            { status: 400 }
        );
    }

    if (response_type !== 'code') {
        return NextResponse.json(
            {
                error: 'unsupported_response_type',
                error_description: 'Only authorization code flow is supported'
            },
            { status: 400 }
        );
    }

    // Build Auth0 authorization URL
    const auth0Params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.AUTH0_M2M_CLIENT_ID || '', // Machine-to-machine client ID
        redirect_uri: `${process.env.APP_BASE_URL}/api/v1/oauth/callback`,
        scope: `openid email profile ${scope}`,
        audience: process.env.AUTH0_API_AUDIENCE || '',
        state: JSON.stringify({
            client_id,
            redirect_uri,
            original_state: state
        })
    });

    const auth0Url = `https://${process.env.AUTH0_DOMAIN}/authorize?${auth0Params}`;

    return NextResponse.redirect(auth0Url);
} 