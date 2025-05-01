import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core"

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
})

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id")
    .notNull()
    .references(() => surveys.id, { onDelete: "cascade" }),
  respondentId: text("respondent_id"),
  respondentName: text("respondent_name"),
  respondentEmail: text("respondent_email"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
})

export type Survey = typeof surveys.$inferSelect
export type NewSurvey = typeof surveys.$inferInsert

export type Response = typeof responses.$inferSelect
export type NewResponse = typeof responses.$inferInsert
