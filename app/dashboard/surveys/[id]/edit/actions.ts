"use server"

import { updateSurvey } from "@/lib/actions/survey-actions"
import { redirect } from "next/navigation"

export async function handleUpdate(id: number, formData: FormData) {
  await updateSurvey(id, formData)
  redirect("/dashboard")
}

export async function handleCancel() {
  redirect("/dashboard")
}
