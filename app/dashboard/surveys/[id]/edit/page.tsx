"use client"

import { SurveyForm } from "@/components/survey-form"
import { getSurvey } from "@/lib/actions/survey-actions"
import { handleUpdate } from "./actions"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"

export default async function EditSurveyPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number.parseInt(params.id)
  const survey = await getSurvey(id)
  const router = useRouter()

  if (!survey) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Survey</h1>
      <SurveyForm
        survey={survey}
        onSubmit={async (formData) => {
          await handleUpdate(id, formData)
        }}
        onCancel={() => {
          router.push("/dashboard")
        }}
      />
    </div>
  )
}
