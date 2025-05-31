-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    auth0_id text NOT NULL,
    email text NOT NULL,
    name text,
    plan text DEFAULT 'free'::text,
    is_email_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id text NOT NULL,
    plan text NOT NULL DEFAULT 'free'::text,
    status text NOT NULL DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    will_cancel_at_period_end boolean NOT NULL DEFAULT false,
    stripe_subscription_id text,
    PRIMARY KEY (id),
    UNIQUE (user_id)
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    creator_id uuid NOT NULL,
    objective text NOT NULL,
    orientations text,
    is_active boolean DEFAULT true,
    allow_anonymous boolean NOT NULL DEFAULT true,
    is_one_per_respondent boolean NOT NULL DEFAULT false,
    end_date timestamp with time zone,
    max_questions integer,
    max_characters integer,
    survey_summary text,
    survey_tags text[],
    first_question text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    survey_id uuid NOT NULL,
    respondent_id text,
    respondent_email text,
    respondent_name text,
    conversation jsonb NOT NULL,
    summary text,
    summary_generated_at timestamp with time zone,
    tags text[],
    insight_level integer,
    insight_explanation text,
    completed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE surveys
    ADD CONSTRAINT IF NOT EXISTS surveys_creator_id_fkey
    FOREIGN KEY (creator_id)
    REFERENCES users(id);

ALTER TABLE responses
    ADD CONSTRAINT IF NOT EXISTS responses_survey_id_fkey
    FOREIGN KEY (survey_id)
    REFERENCES surveys(id);

-- Add unique constraints
ALTER TABLE users
    ADD CONSTRAINT IF NOT EXISTS users_auth0_id_key
    UNIQUE (auth0_id);

ALTER TABLE users
    ADD CONSTRAINT IF NOT EXISTS users_email_key
    UNIQUE (email);

-- Add constraint to ensure insight level is between 0 and 10
ALTER TABLE responses
    ADD CONSTRAINT check_insight_level 
    CHECK (insight_level IS NULL OR (insight_level >= 0 AND insight_level <= 10));

-- Add constraint to ensure response tags are a subset of survey tags
ALTER TABLE responses
    ADD CONSTRAINT IF NOT EXISTS response_tags_subset_of_survey_tags
    CHECK (
        tags IS NULL OR
        NOT EXISTS (
            SELECT 1
            FROM surveys s
            WHERE s.id = responses.survey_id
            AND EXISTS (
                SELECT 1
                FROM unnest(responses.tags) AS tag
                WHERE tag NOT IN (
                    SELECT unnest(s.survey_tags)
                )
            )
        )
    ); 