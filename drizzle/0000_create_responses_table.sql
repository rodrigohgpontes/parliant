CREATE TABLE IF NOT EXISTS "responses" (
  "id" SERIAL PRIMARY KEY,
  "survey_id" INTEGER NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
  "respondent_id" TEXT,
  "respondent_name" TEXT,
  "respondent_email" TEXT,
  "data" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completed_at" TIMESTAMP
);
