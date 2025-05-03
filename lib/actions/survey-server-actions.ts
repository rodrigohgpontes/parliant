"use server";

import { redirect } from "next/navigation";
import { getSurveysServer, getSurveyServer } from "@/lib/actions/server-data-actions";
import { createAuthenticatedSurvey, updateAuthenticatedSurvey, deleteAuthenticatedSurvey } from "@/lib/actions/server-actions";

export async function getSurveysServerAction() {
    return getSurveysServer();
}

export async function getSurveyServerAction(id: string) {
    return getSurveyServer(id);
}

export async function createSurveyServerAction(data: FormData) {
    await createAuthenticatedSurvey(data);
    redirect("/dashboard");
}

export async function updateSurveyServerAction(id: string, data: FormData) {
    await updateAuthenticatedSurvey(id, data);
    redirect("/dashboard");
}

export async function deleteSurveyServerAction(id: string) {
    await deleteAuthenticatedSurvey(id);
} 