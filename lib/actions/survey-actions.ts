"use client";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";
import { revalidateDashboard, revalidateSurveyAndDashboard } from "./server-actions";

export async function getSurveys() {
  const { user } = useUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const result = await db`
    SELECT * FROM surveys 
    WHERE user_id = ${user.sub}
    ORDER BY created_at DESC
  `;
  return result;
}

export async function getSurvey(id: number) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const results = await db`
    SELECT * FROM surveys 
    WHERE id = ${id} AND user_id = ${user.sub}
  `;

  return results[0] || null;
}

export async function createSurvey(data: FormData) {
  const { user } = useUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const title = data.get("title") as string;
  const description = data.get("description") as string;

  if (!title) {
    throw new Error("Title is required");
  }

  await db`
    INSERT INTO surveys (user_id, title, description)
    VALUES (${user.sub}, ${title}, ${description})
  `;
  await revalidateDashboard();
  redirect("/dashboard");
}

export async function updateSurvey(id: number, data: FormData) {
  const { user } = useUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const title = data.get("title") as string;
  const description = data.get("description") as string;

  if (!title) {
    throw new Error("Title is required");
  }

  await db`
    UPDATE surveys 
    SET title = ${title}, description = ${description}
    WHERE id = ${id} AND user_id = ${user.sub}
  `;
  await revalidateSurveyAndDashboard(id);
  redirect("/dashboard");
}

export async function deleteSurvey(id: number) {
  const { user } = useUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  await db`
    DELETE FROM surveys 
    WHERE id = ${id} AND user_id = ${user.sub}
  `;
  await revalidateDashboard();
}
