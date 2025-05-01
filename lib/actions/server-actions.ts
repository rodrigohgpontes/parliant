"use server";

import { revalidatePath } from "next/cache";

export async function revalidateSurveyPath(surveyId: number) {
    revalidatePath(`/dashboard/surveys/${surveyId}`);
}

export async function revalidateDashboard() {
    revalidatePath("/dashboard");
}

export async function revalidateSurveyAndDashboard(surveyId: number) {
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/surveys/${surveyId}`);
} 