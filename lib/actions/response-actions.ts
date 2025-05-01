"use server"

import { db } from "@/lib/db"
import { responses, surveys, type NewResponse } from "@/lib/db/schema"
import { getSession } from "@auth0/nextjs-auth0"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getResponses(surveyId: number) {
  const session = await getSession()

  if (!session?.user) {
    return []
  }

  // First verify that the survey belongs to the user
  const surveyResult = await db.query.surveys.findFirst({
    where: and(eq(surveys.id, surveyId), eq(surveys.userId, session.user.sub)),
  })

  if (!surveyResult) {
    return []
  }

  // Then get the responses for the survey
  return db.query.responses.findMany({
    where: eq(responses.surveyId, surveyId),
    orderBy: (responses, { desc }) => [desc(responses.createdAt)],
  })
}

export async function getResponse(responseId: number) {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  // Join responses with surveys to verify ownership
  const result = await db.query.responses.findFirst({
    where: eq(responses.id, responseId),
    with: {
      survey: {
        columns: {
          userId: true,
        },
      },
    },
  })

  if (!result || result.survey.userId !== session.user.sub) {
    return null
  }

  return result
}

export async function createResponse(surveyId: number, formData: FormData) {
  // This action is public and doesn't require authentication
  // It's used by respondents to submit survey responses

  const name = formData.get("name") as string
  const email = formData.get("email") as string

  // In a real implementation, you would collect the actual survey responses
  // For now, we'll just store some sample data
  const sampleData = {
    questions: [
      {
        question: "How would you rate our service?",
        answer: "Very satisfied",
      },
      {
        question: "What improvements would you suggest?",
        answer: "Better mobile experience",
      },
    ],
  }

  const newResponse: NewResponse = {
    surveyId,
    respondentName: name,
    respondentEmail: email,
    data: sampleData,
    createdAt: new Date(),
    completedAt: new Date(),
  }

  await db.insert(responses).values(newResponse)

  // Redirect to a thank you page
  redirect(`/surveys/${surveyId}/thank-you`)
}

export async function deleteResponse(responseId: number) {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // First verify that the response belongs to a survey owned by the user
  const responseResult = await db.query.responses.findFirst({
    where: eq(responses.id, responseId),
    with: {
      survey: {
        columns: {
          userId: true,
          id: true,
        },
      },
    },
  })

  if (!responseResult || responseResult.survey.userId !== session.user.sub) {
    throw new Error("Unauthorized")
  }

  const surveyId = responseResult.survey.id

  await db.delete(responses).where(eq(responses.id, responseId))

  revalidatePath(`/dashboard/surveys/${surveyId}/responses`)
}
