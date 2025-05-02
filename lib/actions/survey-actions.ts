"use client";

import { redirect } from "next/navigation";

interface Survey {
  id: string;
  title: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  is_active: boolean;
}

async function revalidateDashboard() {
  // Implementation for revalidating dashboard data
}

async function revalidateSurveyAndDashboard(id: string) {
  // Implementation for revalidating survey and dashboard data
}

export async function getSurveys() {
  const response = await fetch('/api/surveys');
  if (!response.ok) {
    throw new Error('Failed to fetch surveys');
  }
  return response.json();
}

export async function getSurvey(id: string) {
  const response = await fetch(`/api/surveys/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch survey');
  }
  return response.json();
}

export async function createSurvey(data: FormData) {
  console.log(' >>> createSurvey ', data);
  const response = await fetch('/api/surveys', {
    method: 'POST',
    body: data
  });

  if (!response.ok) {
    throw new Error('Failed to create survey');
  }

  console.log(' >>> createSurvey response ', response);

  redirect("/dashboard");
}

export async function updateSurvey(id: string, data: FormData) {
  const response = await fetch(`/api/surveys/${id}`, {
    method: 'PUT',
    body: data
  });

  if (!response.ok) {
    throw new Error('Failed to update survey');
  }

  redirect("/dashboard");
}

export async function deleteSurvey(id: string) {
  const response = await fetch(`/api/surveys/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete survey');
  }
}
