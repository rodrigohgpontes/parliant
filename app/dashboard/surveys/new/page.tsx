"use client";

import { SurveyForm } from "@/components/survey-form";
import { createSurveyServerAction } from "@/lib/actions/survey-server-actions";
import { useRouter } from "next/navigation";

export default function NewSurveyPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Survey</h1>
      <SurveyForm
        onSubmit={async (formData) => {
          await createSurveyServerAction(formData);
        }}
        onCancel={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
