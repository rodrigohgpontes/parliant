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