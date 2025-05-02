"use server";

import { updateSurvey } from "@/lib/actions/survey-actions";
import { redirect } from "next/navigation";

export async function handleUpdate(id: string, formData: FormData) {
    await updateSurvey(id, formData);
    redirect("/dashboard");
} 