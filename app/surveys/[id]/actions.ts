"use client";

import { createAuthenticatedResponse } from "@/lib/actions/server-actions";
import { redirect } from "next/navigation";

export async function createSurveyResponse(surveyId: number, formData: FormData) {
  await createAuthenticatedResponse(surveyId, formData);
  redirect(`/surveys/${surveyId}/thank-you`);
}
