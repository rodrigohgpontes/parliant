import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { db } from '@/lib/db';

// Create JWKS client for Auth0
const jwksClient = jwksRsa({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    cacheMaxAge: 600000, // 10 minutes
});

// Helper to get signing key
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    jwksClient.getSigningKey(header.kid, (err: Error | null, key?: jwksRsa.SigningKey) => {
        if (err) {
            callback(err);
            return;
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

export interface ApiUser {
    sub: string;
    email: string;
    scope: string;
    azp: string; // Authorized party (client_id)
}

export async function validateApiToken(req: NextRequest): Promise<ApiUser | null> {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);

    try {
        // Verify JWT token
        const decoded = await new Promise<any>((resolve, reject) => {
            jwt.verify(
                token,
                getKey,
                {
                    audience: process.env.AUTH0_API_AUDIENCE,
                    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
                    algorithms: ['RS256']
                },
                (err: jwt.VerifyErrors | null, decoded?: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded);
                    }
                }
            );
        });

        // Validate scopes
        if (!decoded.scope) {
            return null;
        }

        return {
            sub: decoded.sub,
            email: decoded.email,
            scope: decoded.scope,
            azp: decoded.azp,
        };
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

export function hasScope(userScopes: string, requiredScope: string): boolean {
    const scopes = userScopes.split(' ');
    return scopes.includes(requiredScope);
}

export function createApiError(
    code: string,
    message: string,
    status: number,
    details?: any
) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                details,
                request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
        },
        { status }
    );
} 