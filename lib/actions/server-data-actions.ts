"use server";

import { db } from "@/lib/db/index";
import { getSession } from "@/lib/auth0";

interface Survey {
    id: string;
    title: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    user_id: string;
    is_active?: boolean;
}

interface User {
    id: string;
    auth0_id: string;
    email: string;
}

export async function getSurveysServer(): Promise<Survey[]> {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id, auth0_id, email FROM users 
        WHERE auth0_id = ${user.sub}
    ` as QueryResult<User>;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    const result = await db`
        SELECT * FROM surveys 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
    ` as QueryResult<Survey>;

    if (!result) {
        return [];
    }

    return result.map(survey => ({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        created_at: new Date(survey.created_at),
        updated_at: new Date(survey.updated_at),
        user_id: survey.user_id,
        is_active: survey.is_active
    }));
}

export async function getSurveyServer(id: string): Promise<Survey | null> {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        return null;
    }

    const results = await db`
    SELECT * FROM surveys 
    WHERE id = ${id} AND user_id = ${user.sub}
  ` as QueryResult<Survey>;

    if (!results?.length) {
        return null;
    }

    const survey = results[0];
    return {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        created_at: new Date(survey.created_at),
        updated_at: new Date(survey.updated_at),
        user_id: survey.user_id,
        is_active: survey.is_active
    };
}

export async function getResponsesServer(surveyId: number) {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        return [];
    }

    // First verify that the survey belongs to the user
    const surveyResult = await db`
    SELECT * FROM surveys 
    WHERE id = ${surveyId} AND user_id = ${user.sub}
  `;

    if (!surveyResult.length) {
        return [];
    }

    const responses = await db`
    SELECT * FROM responses 
    WHERE survey_id = ${surveyId}
    ORDER BY created_at DESC
  `;
    return responses;
}

export async function getResponseServer(responseId: number) {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        return null;
    }

    const response = await db`
    SELECT * FROM responses 
    WHERE id = ${responseId}
  `;

    if (!response.length) {
        return null;
    }

    // Verify that the survey belongs to the user
    const survey = await db`
    SELECT * FROM surveys 
    WHERE id = ${response[0].survey_id} AND user_id = ${user.sub}
  `;

    if (!survey.length) {
        return null;
    }

    return response[0];
} 