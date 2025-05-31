import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    return NextResponse.json({
        name: 'Parliant Public API',
        version: 'v1',
        documentation: `${process.env.APP_BASE_URL}/api/v1/docs`,
        endpoints: {
            oauth: {
                authorize: '/api/v1/oauth/authorize',
                token: '/api/v1/oauth/token',
                revoke: '/api/v1/oauth/revoke',
            },
            user: {
                me: '/api/v1/me',
            },
            surveys: {
                list: '/api/v1/surveys',
                create: '/api/v1/surveys',
                get: '/api/v1/surveys/{surveyId}',
                update: '/api/v1/surveys/{surveyId}',
                delete: '/api/v1/surveys/{surveyId}',
                archive: '/api/v1/surveys/{surveyId}/archive',
                responses: '/api/v1/surveys/{surveyId}/responses',
            },
            responses: {
                get: '/api/v1/responses/{responseId}',
                updateAnalysis: '/api/v1/responses/{responseId}/analysis',
            },
            analytics: {
                surveyAnalytics: '/api/v1/surveys/{surveyId}/analytics',
                insights: '/api/v1/surveys/{surveyId}/insights',
            },
            webhooks: {
                list: '/api/v1/webhooks',
                create: '/api/v1/webhooks',
                get: '/api/v1/webhooks/{webhookId}',
                update: '/api/v1/webhooks/{webhookId}',
                delete: '/api/v1/webhooks/{webhookId}',
                test: '/api/v1/webhooks/{webhookId}/test',
            },
            exports: {
                createExport: '/api/v1/surveys/{surveyId}/responses/export',
                getExportStatus: '/api/v1/exports/{exportId}',
            }
        },
        authentication: {
            type: 'OAuth2',
            flow: 'authorization_code',
            authorizationUrl: '/api/v1/oauth/authorize',
            tokenUrl: '/api/v1/oauth/token',
            scopes: {
                'profile:read': 'Read user profile information',
                'surveys:read': 'Read survey data',
                'surveys:write': 'Create and modify surveys',
                'responses:read': 'Read survey responses',
                'responses:write': 'Submit survey responses',
                'analytics:read': 'Access analytics data',
                'webhooks:write': 'Manage webhooks',
            }
        },
        rate_limits: {
            free: '100 requests/hour',
            pro: '1,000 requests/hour',
            enterprise: '10,000 requests/hour',
        },
        contact: {
            support: 'support@parliant.com',
            documentation: 'https://docs.parliant.com/api',
        }
    });
} 