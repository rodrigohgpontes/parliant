"use client"

import { SurveyForm } from "@/components/survey-form"
import { createSurvey } from "@/lib/actions/survey-actions"
import { useRouter } from "next/navigation"

export default function NewSurveyPage() {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Survey</h1>
      <SurveyForm onSubmit={createSurvey} onCancel={() => router.push("/dashboard")} />
    </div>
  )
}
