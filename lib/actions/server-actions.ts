"use server";

import { revalidatePath } from "next/cache";
import { getSession, getUser } from "@/lib/auth0";
import { createResponse } from "./response-actions";
import { db } from "@/lib/db/index";

interface Survey {
    id: string;
    title: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    user_id: string;
    is_active: boolean;
}

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

export async function createAuthenticatedResponse(surveyId: number, formData: FormData) {
    const user = await getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    await createResponse(surveyId, formData);
}

export async function getAuthenticatedSurveys() {
    const user = await getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    `;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    const result = await db`
    SELECT * FROM surveys 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
    return result;
}

export async function getAuthenticatedSurvey(id: string): Promise<Survey | null> {
    const user = await getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    `;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    const result = await db`
    SELECT * FROM surveys 
    WHERE id = ${id} AND user_id = ${userId}
  ` as unknown as Survey[];

    if (!result.length) {
        return null;
    }

    return {
        id: result[0].id,
        title: result[0].title,
        description: result[0].description,
        created_at: new Date(result[0].created_at),
        updated_at: new Date(result[0].updated_at),
        user_id: result[0].user_id,
        is_active: result[0].is_active
    };
}

export async function createAuthenticatedSurvey(data: FormData) {
    const user = await getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    `;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;
    const title = data.get("title") as string;
    const description = data.get("description") as string;

    if (!title) {
        throw new Error("Title is required");
    }

    await db`
    INSERT INTO surveys (user_id, title, description)
    VALUES (${userId}, ${title}, ${description})
  `;
    await revalidateDashboard();
}

export async function updateAuthenticatedSurvey(id: string, data: FormData) {
    const user = await getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    `;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;
    const title = data.get("title") as string;
    const description = data.get("description") as string;

    if (!title) {
        throw new Error("Title is required");
    }

    await db`
    UPDATE surveys 
    SET title = ${title}, description = ${description}
    WHERE id = ${id} AND user_id = ${userId}
  `;
    await revalidateSurveyAndDashboard(Number(id));
}

export async function deleteAuthenticatedSurvey(id: string) {
    const user = await getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    `;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    await db`
    DELETE FROM surveys 
    WHERE id = ${id} AND user_id = ${userId}
  `;
    await revalidateDashboard();
} 