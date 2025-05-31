# Public API Infrastructure Design

## Overview

This document outlines the foundational infrastructure for a public REST API designed to enable external integrations with platforms like Make.com, Zapier, Salesforce, HubSpot, and other third-party services.

## Authentication

### OAuth2 Authorization Code Flow with Auth0

The API uses OAuth2 "authorization code" flow for authentication, leveraging Auth0 as the identity provider.

#### OAuth2 Endpoints

```
GET  /oauth/authorize
POST /oauth/token
POST /oauth/revoke
GET  /oauth/.well-known/openid-configuration
```

#### Authentication Flow

1. **Authorization Request**
   ```
   GET https://api.yourdomain.com/oauth/authorize?
     response_type=code&
     client_id={client_id}&
     redirect_uri={redirect_uri}&
     scope=surveys:read surveys:write responses:read&
     state={state}
   ```

2. **Token Exchange**
   ```
   POST https://api.yourdomain.com/oauth/token
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=authorization_code&
   code={authorization_code}&
   client_id={client_id}&
   client_secret={client_secret}&
   redirect_uri={redirect_uri}
   ```

3. **API Request with Bearer Token**
   ```
   GET https://api.yourdomain.com/v1/surveys
   Authorization: Bearer {access_token}
   ```

### Scopes

- `profile:read` - Read user profile information
- `surveys:read` - Read survey data
- `surveys:write` - Create and modify surveys
- `responses:read` - Read survey responses
- `responses:write` - Submit survey responses
- `analytics:read` - Access analytics data
- `webhooks:write` - Manage webhooks

## API Versioning

The API uses URL versioning: `https://api.yourdomain.com/v1/`

## Core Endpoints

### User Management

#### Get Current User
```
GET /v1/me
Scopes: profile:read
Response: User object with subscription details
```

#### Update User Profile
```
PATCH /v1/me
Scopes: profile:read
Request: { name, preferences }
Response: Updated user object
```

### Surveys

#### List Surveys
```
GET /v1/surveys
Scopes: surveys:read
Query params: 
  - page (default: 1)
  - limit (default: 20, max: 100)
  - is_active (boolean)
  - created_after (ISO 8601)
  - created_before (ISO 8601)
  - tags (comma-separated)
Response: Paginated list of surveys
```

#### Get Survey
```
GET /v1/surveys/{survey_id}
Scopes: surveys:read
Response: Survey object with full details
```

#### Create Survey
```
POST /v1/surveys
Scopes: surveys:write
Request: {
  objective: string,
  orientations: string,
  allow_anonymous: boolean,
  is_one_per_respondent: boolean,
  end_date: ISO 8601,
  max_questions: integer,
  max_characters: integer,
  survey_tags: string[],
  first_question: string
}
Response: Created survey object
```

#### Update Survey
```
PATCH /v1/surveys/{survey_id}
Scopes: surveys:write
Request: Partial survey object
Response: Updated survey object
```

#### Delete Survey
```
DELETE /v1/surveys/{survey_id}
Scopes: surveys:write
Response: 204 No Content
```

#### Archive/Deactivate Survey
```
POST /v1/surveys/{survey_id}/archive
Scopes: surveys:write
Response: Updated survey object
```

### Survey Responses

#### List Responses
```
GET /v1/surveys/{survey_id}/responses
Scopes: responses:read
Query params:
  - page (default: 1)
  - limit (default: 20, max: 100)
  - completed_after (ISO 8601)
  - completed_before (ISO 8601)
  - insight_level_min (0-10)
  - tags (comma-separated)
Response: Paginated list of responses
```

#### Get Response
```
GET /v1/responses/{response_id}
Scopes: responses:read
Response: Response object with full conversation
```

#### Submit Response
```
POST /v1/surveys/{survey_id}/responses
Scopes: responses:write
Request: {
  respondent_email: string,
  respondent_name: string,
  conversation: object
}
Response: Created response object
```

#### Update Response Analysis
```
PATCH /v1/responses/{response_id}/analysis
Scopes: responses:write
Request: {
  summary: string,
  tags: string[],
  insight_level: integer (0-10),
  insight_explanation: string
}
Response: Updated response object
```

### Analytics

#### Survey Analytics
```
GET /v1/surveys/{survey_id}/analytics
Scopes: analytics:read
Response: {
  total_responses: integer,
  completion_rate: float,
  average_insight_level: float,
  response_trends: object[],
  tag_distribution: object,
  sentiment_analysis: object
}
```

#### Response Insights
```
GET /v1/surveys/{survey_id}/insights
Scopes: analytics:read
Query params:
  - group_by (tag, insight_level, date)
  - period (day, week, month)
Response: Aggregated insights data
```

### Webhooks

#### List Webhooks
```
GET /v1/webhooks
Scopes: webhooks:write
Response: List of configured webhooks
```

#### Create Webhook
```
POST /v1/webhooks
Scopes: webhooks:write
Request: {
  url: string,
  events: string[],
  active: boolean,
  secret: string
}
Response: Created webhook object
```

#### Update Webhook
```
PATCH /v1/webhooks/{webhook_id}
Scopes: webhooks:write
Request: Partial webhook object
Response: Updated webhook object
```

#### Delete Webhook
```
DELETE /v1/webhooks/{webhook_id}
Scopes: webhooks:write
Response: 204 No Content
```

#### Test Webhook
```
POST /v1/webhooks/{webhook_id}/test
Scopes: webhooks:write
Response: Test result object
```

### Webhook Events

- `survey.created`
- `survey.updated`
- `survey.archived`
- `response.submitted`
- `response.analyzed`
- `response.updated`
- `subscription.changed`

## Bulk Operations

### Bulk Export Responses
```
POST /v1/surveys/{survey_id}/responses/export
Scopes: responses:read
Request: {
  format: "csv" | "json",
  filters: object
}
Response: {
  export_id: string,
  status: "pending",
  download_url: string (when ready)
}
```

### Check Export Status
```
GET /v1/exports/{export_id}
Scopes: responses:read
Response: Export status object
```

## Rate Limiting

Rate limits are enforced per API key:

- **Free tier**: 100 requests/hour
- **Pro tier**: 1,000 requests/hour
- **Enterprise**: 10,000 requests/hour

Headers returned:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Error Responses

Standard error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "request_id": "req_123456"
  }
}
```

Error codes:
- `AUTHENTICATION_ERROR` (401)
- `AUTHORIZATION_ERROR` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `SERVER_ERROR` (500)

## Pagination

All list endpoints support pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_previous": false
  },
  "links": {
    "self": "/v1/surveys?page=1&limit=20",
    "next": "/v1/surveys?page=2&limit=20",
    "last": "/v1/surveys?page=8&limit=20"
  }
}
```

## Response Formats

All responses follow a consistent format:

### Single Resource
```json
{
  "data": {
    "id": "uuid",
    "type": "survey",
    "attributes": {...},
    "relationships": {...}
  }
}
```

### Collection
```json
{
  "data": [...],
  "pagination": {...},
  "links": {...}
}
```

## Security Considerations

1. **HTTPS Only**: All API traffic must use HTTPS
2. **CORS**: Configurable CORS headers for browser-based integrations
3. **API Key Rotation**: Support for multiple active keys per integration
4. **IP Whitelisting**: Optional IP restrictions for enterprise customers
5. **Request Signing**: Optional HMAC signature verification for webhooks
6. **Audit Logging**: All API access is logged for security and compliance

## Integration-Specific Features

### Zapier Integration
- Provide dynamic dropdowns for survey selection
- Support for custom fields mapping
- Real-time triggers via webhooks

### Make.com Integration
- Batch operations support
- Custom modules for complex workflows
- Error handling with retry logic

### Salesforce Integration
- Custom object mapping
- Bi-directional sync capabilities
- Support for Salesforce Events

### HubSpot Integration
- Contact property mapping
- Timeline events for responses
- Custom workflow triggers

## Implementation Recommendations

1. **Use OpenAPI 3.0 Specification** for API documentation
2. **Implement API Gateway** (e.g., Kong, AWS API Gateway) for:
   - Rate limiting
   - Authentication
   - Request/response transformation
   - Caching
3. **Use GraphQL** as an alternative endpoint for complex queries
4. **Implement SDKs** for popular languages (JavaScript, Python, PHP)
5. **Provide Postman Collection** for easy testing
6. **Set up Developer Portal** with:
   - Interactive documentation
   - API key management
   - Usage analytics
   - Code examples

## Monitoring and Analytics

Track the following metrics:
- API usage by endpoint
- Response times
- Error rates
- Integration adoption
- Rate limit violations
- Webhook delivery success rate

## Compliance

Ensure compliance with:
- GDPR (data export/deletion endpoints)
- CCPA (privacy controls)
- SOC 2 (security controls)
- HIPAA (if handling healthcare data) 