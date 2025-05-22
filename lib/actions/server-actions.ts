"use server";

import { revalidatePath } from "next/cache";
import { getSession, getUser } from "@/lib/auth0";
import { createResponse } from "./response-actions";
import { db } from "@/lib/db/index";

interface Survey {
    id: string;
    objective: string;
    orientations?: string;
    created_at: Date;
    updated_at: Date;
    creator_id: string;
    is_active: boolean;
    allow_anonymous: boolean;
    is_one_per_respondent: boolean;
    end_date?: Date;
    max_questions?: number;
    max_characters?: number;
    survey_summary?: string;
    survey_tags?: string[];
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
    WHERE id = ${id} AND creator_id = ${userId}
    AND (deleted_at IS NULL)
  ` as unknown as Survey[];

    if (!result.length) {
        return null;
    }

    return {
        id: result[0].id,
        objective: result[0].objective,
        orientations: result[0].orientations,
        created_at: new Date(result[0].created_at),
        updated_at: new Date(result[0].updated_at),
        creator_id: result[0].creator_id,
        is_active: result[0].is_active,
        allow_anonymous: result[0].allow_anonymous,
        is_one_per_respondent: result[0].is_one_per_respondent,
        end_date: result[0].end_date ? new Date(result[0].end_date) : undefined,
        max_questions: result[0].max_questions,
        max_characters: result[0].max_characters,
        survey_summary: result[0].survey_summary,
        survey_tags: result[0].survey_tags
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

    // Get the subscription plan
    const subscriptionResult = await db`
        SELECT plan, status 
        FROM subscriptions 
        WHERE user_id = ${userResult[0].id}
    `;

    const userId = userResult[0].id;
    const userPlan = subscriptionResult[0]?.plan || 'free';

    // If user is on free plan, check survey count
    if (userPlan === 'free') {
        const surveyCount = await db`
            SELECT COUNT(*) as count FROM surveys 
            WHERE creator_id = ${userId}
            AND deleted_at IS NULL
        `;

        if (surveyCount[0].count > 3) {
            return { success: false, error: "Free plan limited to 3 surveys. Please upgrade to create more surveys." };
        }
    }

    const title = data.get("title") as string;
    const description = data.get("description") as string;
    const firstQuestion = data.get("first_question") as string;
    const allowAnonymous = data.get("allow_anonymous") === "on";

    if (!title) {
        return { success: false, error: "Title is required" };
    }

    await db`
    INSERT INTO surveys (creator_id, objective, orientations, first_question, allow_anonymous)
    VALUES (${userId}, ${title}, ${description}, ${firstQuestion}, ${allowAnonymous})
  `;
    await revalidateDashboard();
    return { success: true };
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
    SET objective = ${title}, orientations = ${description}
    WHERE id = ${id} AND creator_id = ${userId}
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
    const now = new Date();

    // Soft delete the survey and its responses
    await db`
        UPDATE surveys 
        SET deleted_at = ${now}
        WHERE id = ${id} AND creator_id = ${userId}
    `;

    await db`
        UPDATE responses 
        SET deleted_at = ${now}
        WHERE survey_id = ${id}
    `;

    await revalidateDashboard();
} 