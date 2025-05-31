import { NextRequest, NextResponse } from 'next/server';
import { createApiError } from './auth';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore: RateLimitStore = {};

// Clean up expired entries every minute
setInterval(() => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach(key => {
        if (rateLimitStore[key].resetTime < now) {
            delete rateLimitStore[key];
        }
    });
}, 60000);

export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

export const RATE_LIMIT_TIERS: { [key: string]: RateLimitConfig; } = {
    free: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 100
    },
    pro: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 1000
    },
    enterprise: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10000
    }
};

export async function getUserTier(userId: string): Promise<string> {
    // In production, this would query the database for the user's subscription tier
    // For now, we'll use a simple implementation
    // TODO: Implement actual database query
    return 'free';
}

export async function checkRateLimit(
    clientId: string,
    tier: string = 'free'
): Promise<{ allowed: boolean; limit: number; remaining: number; resetTime: number; }> {
    const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.free;
    const now = Date.now();
    const key = `${clientId}:${tier}`;

    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
        rateLimitStore[key] = {
            count: 0,
            resetTime: now + config.windowMs
        };
    }

    const entry = rateLimitStore[key];
    const allowed = entry.count < config.maxRequests;

    if (allowed) {
        entry.count++;
    }

    return {
        allowed,
        limit: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - entry.count),
        resetTime: entry.resetTime
    };
}

export async function rateLimitMiddleware(
    req: NextRequest,
    clientId: string,
    tier: string = 'free'
) {
    const rateLimitCheck = await checkRateLimit(clientId, tier);

    if (!rateLimitCheck.allowed) {
        const response = createApiError(
            'RATE_LIMIT_EXCEEDED',
            'Rate limit exceeded. Please try again later.',
            429,
            {
                limit: rateLimitCheck.limit,
                reset: new Date(rateLimitCheck.resetTime).toISOString()
            }
        );

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', rateLimitCheck.limit.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', rateLimitCheck.resetTime.toString());

        return response;
    }

    // Return null to indicate the request can proceed
    return null;
}

export function addRateLimitHeaders(
    response: NextResponse,
    rateLimitInfo: { limit: number; remaining: number; resetTime: number; }
) {
    response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
    return response;
} 