# Parliant - Requirements Document

## Project Overview

Parliant is a survey application with a public API infrastructure designed for external integrations with platforms like Make.com, Zapier, Salesforce, and HubSpot.

### Core Components
- **Frontend**: Next.js with TypeScript
- **Database**: Neon serverless PostgreSQL
- **Authentication**: Auth0 with OAuth2 authorization code flow
- **API**: RESTful API with JWT authentication

## Technical Architecture

### Stack
- **Frontend Framework**: Next.js 14+ with TypeScript
- **Database**: Neon serverless PostgreSQL
- **Authentication Provider**: Auth0
- **API Authentication**: OAuth2 with JWT tokens
- **Hosting**: To be determined (Vercel recommended)

### Security Requirements
- OAuth2 authorization code flow for third-party integrations
- JWT token validation using JWKS
- HMAC signatures for webhook security
- Scope-based permissions system
- Rate limiting by subscription tier

## Database Schema

### Tables

#### Users
- `id`: UUID (primary key)
- `auth0_id`: Text (unique)
- `email`: Text (unique)
- `name`: Text
- `plan`: Text (default: 'free')
- `is_email_verified`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Subscriptions
- `id`: UUID (primary key)
- `user_id`: Text (unique)
- `plan`: Text (default: 'free')
- `status`: Text (default: 'active')
- `stripe_subscription_id`: Text
- `will_cancel_at_period_end`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Surveys
- `id`: UUID (primary key)
- `creator_id`: UUID (foreign key to users)
- `objective`: Text (required)
- `orientations`: Text
- `is_active`: Boolean (default: true)
- `allow_anonymous`: Boolean (default: true)
- `is_one_per_respondent`: Boolean (default: false)
- `end_date`: Timestamp
- `max_questions`: Integer
- `max_characters`: Integer
- `survey_summary`: Text
- `survey_tags`: Text array
- `first_question`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Responses
- `id`: UUID (primary key)
- `survey_id`: UUID (foreign key to surveys)
- `respondent_id`: Text
- `respondent_email`: Text
- `respondent_name`: Text
- `conversation`: JSONB (required)
- `summary`: Text
- `summary_generated_at`: Timestamp
- `tags`: Text array
- `insight_level`: Integer (0-10)
- `insight_explanation`: Text
- `completed_at`: Timestamp
- `deleted_at`: Timestamp (soft delete)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Database Constraints
- Response tags must be a subset of survey tags
- Insight level must be between 0 and 10
- Foreign key relationships enforced

## API Requirements

### Authentication Flow

#### OAuth2 Endpoints

1. **Authorization Endpoint**
   - Path: `/api/v1/oauth/authorize`
   - Parameters:
     - `client_id`: Required
     - `redirect_uri`: Required
     - `response_type`: Must be "code"
     - `scope`: Space-separated list
     - `state`: Optional CSRF token

2. **Token Endpoint**
   - Path: `/api/v1/oauth/token`
   - Grant Types:
     - `authorization_code`: Exchange code for tokens
     - `refresh_token`: Refresh access token
   - Returns: Access token, refresh token, expiry

3. **Token Revocation**
   - Path: `/api/v1/oauth/revoke`
   - Revokes access or refresh tokens

### API Endpoints

#### User Management
- `GET /api/v1/me` - Get authenticated user profile
- `PATCH /api/v1/me` - Update user profile

#### Survey Management
- `GET /api/v1/surveys` - List surveys (with pagination)
- `POST /api/v1/surveys` - Create survey
- `GET /api/v1/surveys/:id` - Get survey details
- `PUT /api/v1/surveys/:id` - Update survey
- `DELETE /api/v1/surveys/:id` - Archive survey

#### Response Management
- `GET /api/v1/surveys/:id/responses` - List responses (with pagination)
- `POST /api/v1/surveys/:id/responses` - Create response
- `GET /api/v1/responses/:id` - Get response details
- `PATCH /api/v1/responses/:id` - Update response tags
- `DELETE /api/v1/responses/:id` - Soft delete response

#### Analytics
- `GET /api/v1/surveys/:id/analytics` - Get survey analytics
  - Response count, completion rate
  - Average insight level
  - Tag distribution
  - Sentiment analysis
  - Response trends

#### Webhooks
- `GET /api/v1/webhooks` - List webhooks
- `POST /api/v1/webhooks` - Create webhook
- `PUT /api/v1/webhooks/:id` - Update webhook
- `DELETE /api/v1/webhooks/:id` - Delete webhook

#### Bulk Export
- `POST /api/v1/surveys/:id/export` - Request bulk export
- `GET /api/v1/exports/:exportId` - Check export status
- `GET /api/v1/exports/:exportId/download` - Download export

### API Features

#### Rate Limiting
- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1,000 requests/hour
- **Enterprise Tier**: 10,000 requests/hour
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

#### Pagination
- Query parameters: `page`, `limit` (max 100)
- Response headers: `X-Total-Count`, `Link` (RFC 5988)

#### Filtering
- Surveys: `is_active`, `created_after`, `created_before`, `tags`
- Responses: `completed_after`, `completed_before`, `tags`, `min_insight_level`

#### Scopes
- `profile:read` - Read user profile
- `profile:write` - Update user profile
- `surveys:read` - Read surveys
- `surveys:write` - Create/update surveys
- `responses:read` - Read responses
- `responses:write` - Create/update responses
- `analytics:read` - Access analytics
- `webhooks:write` - Manage webhooks

### Webhook Events

#### Event Types
- `survey.created`
- `survey.updated`
- `survey.archived`
- `response.created`
- `response.updated`
- `response.deleted`

#### Webhook Payload
```json
{
  "id": "webhook_event_id",
  "type": "event.type",
  "created_at": "ISO 8601 timestamp",
  "data": {
    // Event-specific data
  }
}
```

#### Security
- HMAC-SHA256 signatures in `X-Parliant-Signature` header
- Retry logic: 3 attempts with exponential backoff
- Event delivery timeout: 30 seconds

## Integration Requirements

### Zapier Integration
- OAuth2 authentication via Platform UI
- Standard OAuth2 flow (no custom fields required)
- Test endpoint: `/api/v1/me`
- Triggers: New response, Survey updated
- Actions: Create survey, Update response tags

### Make.com Integration
- OAuth2 authentication support
- Webhook subscriptions for real-time events
- Bulk operations support

### Salesforce Integration
- OAuth2 authentication
- Custom object mapping for surveys and responses
- Bi-directional sync capabilities

### HubSpot Integration
- OAuth2 authentication
- Contact property mapping
- Form submission integration

## Feature Requirements

### Survey Features
1. **Dynamic Conversations**: AI-powered conversational surveys
2. **Anonymous Responses**: Optional anonymous submission
3. **Response Limits**: One response per respondent option
4. **Time Limits**: Survey end date configuration
5. **Question Limits**: Maximum questions per survey
6. **Character Limits**: Maximum characters per response
7. **Tagging System**: Hierarchical tags for categorization

### Response Features
1. **AI Summary Generation**: Automatic summary using OpenAI
2. **Insight Scoring**: 0-10 scale with explanation
3. **Tag Inheritance**: Response tags subset of survey tags
4. **Soft Delete**: Responses can be archived
5. **Conversation Storage**: Full conversation history in JSONB

### Analytics Features
1. **Response Metrics**: Count, completion rate
2. **Insight Analysis**: Average scores, distribution
3. **Tag Analytics**: Frequency and co-occurrence
4. **Sentiment Analysis**: Positive/negative/neutral breakdown
5. **Trend Analysis**: Response patterns over time

## Performance Requirements

### API Performance
- Response time: < 200ms for simple queries
- Pagination limit: 100 items per page
- Webhook delivery: < 30 seconds timeout
- Rate limiting: In-memory for development, Redis for production

### Database Performance
- Connection pooling
- Query optimization with indexes
- Efficient JSONB queries for conversation data

## Production Recommendations

### Infrastructure
1. **Rate Limiting**: Migrate from in-memory to Redis
2. **Webhook Queue**: Implement queue system (Bull/RabbitMQ)
3. **File Storage**: S3 for bulk exports
4. **Caching**: Redis for frequently accessed data
5. **Monitoring**: APM and error tracking (Sentry/DataDog)

### Scalability
1. **Database**: Read replicas for analytics queries
2. **API**: Horizontal scaling with load balancer
3. **Background Jobs**: Worker processes for async tasks
4. **CDN**: Static asset delivery

### Security Enhancements
1. **API Key Rotation**: Periodic key rotation
2. **Audit Logging**: Track all API access
3. **IP Whitelisting**: Enterprise tier feature
4. **DDoS Protection**: CloudFlare or similar
5. **Data Encryption**: At rest and in transit

## Development Workflow

### Environment Setup
1. Node.js 18+ with TypeScript
2. PostgreSQL compatible database (Neon)
3. Auth0 tenant configuration
4. Environment variables configuration

### Testing Requirements
1. Unit tests for API endpoints
2. Integration tests for OAuth flow
3. Webhook delivery testing
4. Rate limiting verification
5. Load testing for performance

### Deployment
1. CI/CD pipeline setup
2. Database migration automation
3. Environment-specific configurations
4. Blue-green deployment strategy
5. Rollback procedures 