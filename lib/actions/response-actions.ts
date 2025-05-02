"use server";

import { db } from "@/lib/db/index";
import { redirect } from "next/navigation";
import { revalidateSurveyPath } from "./server-actions";

interface Response {
  id: number;
  survey_id: number;
  data: any;
  respondent_id: string;
  respondent_name: string;
  respondent_email: string;
  completed_at: Date;
}

interface Survey {
  id: number;
  user_id: string;
}

export async function getResponses(surveyId: number) {
  const responses = await db`
    SELECT * FROM responses 
    WHERE survey_id = ${surveyId}
    ORDER BY created_at DESC
  `;
  return responses || [];
}

export async function getResponse(responseId: number) {
  const response = await db`
    SELECT * FROM responses 
    WHERE id = ${responseId}
  `;

  if (!response?.length) {
    return null;
  }

  return response[0];
}

export async function createResponse(surveyId: number, data: FormData) {
  const content = data.get("content") as string;

  if (!content) {
    throw new Error("Content is required");
  }

  await db`
    INSERT INTO responses (
      survey_id, 
      data, 
      completed_at
    )
    VALUES (
      ${surveyId},
      ${JSON.stringify({ content })},
      ${new Date()}
    )
  `;

  await revalidateSurveyPath(surveyId);
}

export async function deleteResponse(responseId: number) {
  const response = await db`
    SELECT * FROM responses 
    WHERE id = ${responseId}
  `;

  if (!response?.length) {
    throw new Error("Response not found");
  }

  await db`
    DELETE FROM responses 
    WHERE id = ${responseId}
  `;

  await revalidateSurveyPath(response[0].survey_id);
}
