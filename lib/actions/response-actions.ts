"use client";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";
import { revalidateSurveyPath } from "./server-actions";

export async function getResponses(surveyId: number) {
  const { user } = useUser();

  if (!user) {
    return [];
  }

  // First verify that the survey belongs to the user
  const surveyResult = await db`
    SELECT * FROM surveys 
    WHERE id = ${surveyId} AND user_id = ${user.sub}
  `;

  if (!surveyResult.length) {
    return [];
  }

  const responses = await db`
    SELECT * FROM responses 
    WHERE survey_id = ${surveyId}
    ORDER BY created_at DESC
  `;
  return responses;
}

export async function getResponse(responseId: number) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const response = await db`
    SELECT * FROM responses 
    WHERE id = ${responseId}
  `;

  if (!response.length) {
    return null;
  }

  // Verify that the survey belongs to the user
  const survey = await db`
    SELECT * FROM surveys 
    WHERE id = ${response[0].survey_id} AND user_id = ${user.sub}
  `;

  if (!survey.length) {
    return null;
  }

  return response[0];
}

export async function createResponse(surveyId: number, data: FormData) {
  const { user } = useUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify that the survey belongs to the user
  const survey = await db`
    SELECT * FROM surveys 
    WHERE id = ${surveyId} AND user_id = ${user.sub}
  `;

  if (!survey.length) {
    throw new Error("Survey not found");
  }

  const content = data.get("content") as string;

  if (!content) {
    throw new Error("Content is required");
  }

  await db`
    INSERT INTO responses (
      survey_id, 
      data, 
      respondent_id, 
      respondent_name, 
      respondent_email, 
      completed_at
    )
    VALUES (
      ${surveyId},
      ${JSON.stringify({ content })},
      ${user.sub},
      ${user.name || user.email},
      ${user.email},
      ${new Date()}
    )
  `;
  await revalidateSurveyPath(surveyId);
}

export async function deleteResponse(responseId: number) {
  const { user } = useUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const response = await db`
    SELECT * FROM responses 
    WHERE id = ${responseId}
  `;

  if (!response.length) {
    throw new Error("Response not found");
  }

  // Verify that the survey belongs to the user
  const survey = await db`
    SELECT * FROM surveys 
    WHERE id = ${response[0].survey_id} AND user_id = ${user.sub}
  `;

  if (!survey.length) {
    throw new Error("Survey not found");
  }

  await db`
    DELETE FROM responses 
    WHERE id = ${responseId}
  `;
  await revalidateSurveyPath(response[0].survey_id);
}
