"use server"

import { createResponse } from "@/lib/actions/response-actions"
import { redirect } from "next/navigation"

export async function createSurveyResponse(surveyId: number, formData: FormData) {
  await createResponse(surveyId, formData)
  redirect(`/surveys/${surveyId}/thank-you`)
}
