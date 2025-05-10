import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    domain: process.env.AUTH0_DOMAIN,
    appBaseUrl: process.env.APP_BASE_URL,
    secret: process.env.AUTH0_SECRET,
    authorizationParameters: {
        scope: 'openid profile email',
        response_type: 'code',
        audience: process.env.AUTH0_AUDIENCE,
    },
    session: {
        cookie: {
            sameSite: 'lax',
            secure: true,
        },
    },
});

export async function deleteAuth0User(auth0Id: string) {
    if (!process.env.AUTH0_MANAGEMENT_API_TOKEN) {
        throw new Error('AUTH0_MANAGEMENT_API_TOKEN is not configured');
    }

    if (!process.env.AUTH0_DOMAIN) {
        throw new Error('AUTH0_DOMAIN is not configured');
    }

    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0Id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete Auth0 user: ${response.status} ${response.statusText} - ${errorText}`);
    }
} 