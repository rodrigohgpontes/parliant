"use server"

import { db } from "@/lib/db"
import { surveys, type NewSurvey } from "@/lib/db/schema"
import { getSession } from "@auth0/nextjs-auth0"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getSurveys() {
  const session = await getSession()

  if (!session?.user) {
    return []
  }

  return db.query.surveys.findMany({
    where: eq(surveys.userId, session.user.sub),
    orderBy: (surveys, { desc }) => [desc(surveys.createdAt)],
  })
}

export async function getSurvey(id: number) {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  const results = await db.query.surveys.findMany({
    where: (surveys, { and, eq }) => and(eq(surveys.id, id), eq(surveys.userId, session.user.sub)),
  })

  return results[0] || null
}

export async function createSurvey(formData: FormData) {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title) {
    throw new Error("Title is required")
  }

  const newSurvey: NewSurvey = {
    userId: session.user.sub,
    title,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  }

  await db.insert(surveys).values(newSurvey)

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function updateSurvey(id: number, formData: FormData) {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title) {
    throw new Error("Title is required")
  }

  await db
    .update(surveys)
    .set({
      title,
      description,
      updatedAt: new Date(),
    })
    .where(eq(surveys.id, id))

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/surveys/${id}`)
  redirect("/dashboard")
}

export async function deleteSurvey(id: number) {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  await db.delete(surveys).where(eq(surveys.id, id))

  revalidatePath("/dashboard")
}
