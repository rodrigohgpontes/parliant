"use client";

import { SurveyForm } from "@/components/survey-form";
import { getSurveyServerAction } from "@/lib/actions/survey-server-actions";
import { updateSurveyServerAction } from "@/lib/actions/survey-server-actions";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default async function EditSurveyPage({
  params,
}: {
  params: Promise<{ id: string; }>;
}) {
  const { id } = await params;
  const survey = await getSurveyServerAction(id);
  const router = useRouter();

  if (!survey) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Survey</h1>
      <SurveyForm
        survey={survey}
        onSubmit={async (formData) => {
          await updateSurveyServerAction(id, formData);
        }}
        onCancel={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
