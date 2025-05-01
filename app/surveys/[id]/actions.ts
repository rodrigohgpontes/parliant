"use server";

import { createResponse } from "@/lib/actions/response-actions";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function createSurveyResponse(surveyId: number, formData: FormData) {
  await createResponse(surveyId, formData);
  redirect(`/surveys/${surveyId}/thank-you`);
}

export async function getSurvey(id: number) {
  const surveyResults = await db`
    SELECT * FROM surveys 
    WHERE id = ${id}
  `;

  if (surveyResults.length === 0) {
    return null;
  }

  return surveyResults[0];
}
