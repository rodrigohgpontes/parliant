"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth0";
import { Survey, User, Response } from "@/lib/types";
import { QueryResult } from "neon/serverless";

interface Survey {
    id: string;
    objective: string;
    orientations?: string;
    created_at: Date;
    updated_at: Date;
    creator_id: string;
    is_active?: boolean;
    allow_anonymous: boolean;
    is_one_per_respondent: boolean;
    end_date?: Date;
    max_questions?: number;
    max_characters?: number;
    survey_summary?: string;
    survey_tags?: string[];
}

interface User {
    id: string;
    auth0_id: string;
    email: string;
    name?: string;
    plan: string;
    is_email_verified: boolean;
}

interface Response {
    id: string;
    survey_id: string;
    respondent_id?: string;
    respondent_email?: string;
    respondent_name?: string;
    conversation: any;
    summary?: string;
    tags?: string[];
    completed_at?: Date;
    deleted_at?: Date;
    created_at: Date;
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
        WHERE creator_id = ${userId}
        AND deleted_at IS NULL
        ORDER BY created_at DESC
    ` as QueryResult<Survey>;

    if (!result) {
        return [];
    }

    return result.map(survey => ({
        id: survey.id,
        objective: survey.objective,
        orientations: survey.orientations,
        created_at: new Date(survey.created_at),
        updated_at: new Date(survey.updated_at),
        creator_id: survey.creator_id,
        is_active: survey.is_active,
        allow_anonymous: survey.allow_anonymous,
        is_one_per_respondent: survey.is_one_per_respondent,
        end_date: survey.end_date ? new Date(survey.end_date) : undefined,
        max_questions: survey.max_questions,
        max_characters: survey.max_characters,
        survey_summary: survey.survey_summary,
        survey_tags: survey.survey_tags
    }));
}

export async function getSurveyServer(id: string): Promise<Survey | null> {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        return null;
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    ` as QueryResult<User>;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    const results = await db`
    SELECT * FROM surveys 
    WHERE id = ${id} AND creator_id = ${userId}
  ` as QueryResult<Survey>;

    if (!results?.length) {
        return null;
    }

    const survey = results[0];
    return {
        id: survey.id,
        objective: survey.objective,
        orientations: survey.orientations,
        created_at: new Date(survey.created_at),
        updated_at: new Date(survey.updated_at),
        creator_id: survey.creator_id,
        is_active: survey.is_active,
        allow_anonymous: survey.allow_anonymous,
        is_one_per_respondent: survey.is_one_per_respondent,
        end_date: survey.end_date ? new Date(survey.end_date) : undefined,
        max_questions: survey.max_questions,
        max_characters: survey.max_characters,
        survey_summary: survey.survey_summary,
        survey_tags: survey.survey_tags
    };
}

export async function getResponsesServer(surveyId: string): Promise<Response[]> {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        return [];
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    ` as QueryResult<User>;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    // First verify that the survey belongs to the user
    const surveyResult = await db`
    SELECT * FROM surveys 
    WHERE id = ${surveyId} AND creator_id = ${userId}
  `;

    if (!surveyResult.length) {
        return [];
    }

    const responses = await db`
    SELECT * FROM responses 
    WHERE survey_id = ${surveyId} AND deleted_at IS NULL
    ORDER BY created_at DESC
  ` as QueryResult<Response>;

    return responses || [];
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

export async function updateResponseSummary(responseId: string, summary: string) {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    ` as QueryResult<User>;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    // Verify that the response belongs to a survey owned by the user
    const responseResult = await db`
        SELECT r.survey_id 
        FROM responses r
        JOIN surveys s ON r.survey_id = s.id
        WHERE r.id = ${responseId} AND s.creator_id = ${userId}
    `;

    if (!responseResult.length) {
        throw new Error("Response not found or not authorized");
    }

    // Update the summary
    await db`
        UPDATE responses 
        SET summary = ${summary}
        WHERE id = ${responseId}
    `;
}

export async function updateSurveySummary(surveyId: string, summary: string) {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    ` as QueryResult<User>;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    // Verify that the survey belongs to the user
    const surveyResult = await db`
        SELECT * FROM surveys 
        WHERE id = ${surveyId} AND creator_id = ${userId}
    ` as QueryResult<Survey>;

    if (!surveyResult.length) {
        throw new Error("Survey not found or not authorized");
    }

    // Update the summary
    await db`
        UPDATE surveys 
        SET survey_summary = ${summary}
        WHERE id = ${surveyId}
    `;
}

export async function exportResponsesToCSV(surveyId: string): Promise<string> {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    ` as QueryResult<User>;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    // Verify that the survey belongs to the user
    const surveyResult = await db`
        SELECT * FROM surveys 
        WHERE id = ${surveyId} AND creator_id = ${userId}
    `;

    if (!surveyResult.length) {
        throw new Error("Survey not found or not authorized");
    }

    const responses = await db`
        SELECT * FROM responses 
        WHERE survey_id = ${surveyId} AND deleted_at IS NULL
        ORDER BY created_at DESC
    ` as QueryResult<Response>;

    // Convert responses to CSV format
    const headers = [
        "Response ID",
        "Respondent Name",
        "Respondent Email",
        "Status",
        "Started At",
        "Completed At",
        "Summary",
        "Tags",
        "Conversation"
    ].join(",");

    const rows = responses.map(response => {
        const status = response.completed_at ? "Completed" : "In Progress";
        const startedAt = new Date(response.created_at).toISOString();
        const completedAt = response.completed_at ? new Date(response.completed_at).toISOString() : "";
        const tags = response.tags ? response.tags.join(";") : "";
        const conversation = JSON.stringify(response.conversation);

        return [
            response.id,
            response.respondent_name || "",
            response.respondent_email || "",
            status,
            startedAt,
            completedAt,
            response.summary || "",
            tags,
            conversation
        ].map(field => `"${field.replace(/"/g, '""')}"`).join(",");
    });

    return [headers, ...rows].join("\n");
}

export async function exportSurveyToPDF(surveyId: string): Promise<Buffer> {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    ` as QueryResult<User>;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    // Verify that the survey belongs to the user
    const surveyResult = await db`
        SELECT * FROM surveys 
        WHERE id = ${surveyId} AND creator_id = ${userId}
    ` as QueryResult<Survey>;

    if (!surveyResult.length) {
        throw new Error("Survey not found or not authorized");
    }

    const survey = surveyResult[0];
    const responses = await db`
        SELECT * FROM responses 
        WHERE survey_id = ${surveyId} AND deleted_at IS NULL
        ORDER BY created_at DESC
    ` as QueryResult<Response>;

    // Create PDF document
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    const chunks: Buffer[] = [];

    // Collect PDF chunks
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Wait for the PDF to be fully generated
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        doc.on('error', reject);
    });

    // Add survey details
    doc.fontSize(20).text(survey.objective, { align: 'center' });
    doc.moveDown();

    if (survey.orientations) {
        doc.fontSize(14).text('Orientations', { underline: true });
        doc.fontSize(12).text(survey.orientations);
        doc.moveDown();
    }

    if (survey.survey_summary) {
        doc.fontSize(14).text('Survey Summary', { underline: true });
        doc.fontSize(12).text(survey.survey_summary);
        doc.moveDown(2);
    }

    // Add responses
    doc.fontSize(16).text('Responses', { align: 'center' });
    doc.moveDown();

    responses.forEach((response, index) => {
        doc.fontSize(14).text(`Response ${index + 1}`, { underline: true });
        doc.fontSize(12).text(`Respondent: ${response.respondent_name || response.respondent_email || 'Anonymous'}`);
        doc.text(`Status: ${response.completed_at ? 'Completed' : 'In Progress'}`);
        doc.text(`Started: ${new Date(response.created_at).toLocaleString()}`);
        if (response.completed_at) {
            doc.text(`Completed: ${new Date(response.completed_at).toLocaleString()}`);
        }
        doc.moveDown();

        // Add response summary if available
        if (response.summary) {
            doc.fontSize(12).text('Summary:', { underline: true });
            doc.fontSize(10).text(response.summary);
            doc.moveDown();
        }

        // Add tags if available
        if (response.tags && response.tags.length > 0) {
            doc.fontSize(12).text('Tags:', { underline: true });
            doc.fontSize(10).text(response.tags.join(', '));
            doc.moveDown();
        }

        // Add conversation
        doc.fontSize(12).text('Conversation:', { underline: true });
        doc.moveDown(0.5);

        const conversation = response.conversation || [];
        conversation.forEach((message: any) => {
            const prefix = message.role === 'user' ? 'Respondent: ' : 'Assistant: ';
            doc.fontSize(10)
                .text(prefix + message.content, {
                    width: doc.page.width - 100,
                    align: 'left'
                });
            doc.moveDown(0.5);
        });

        doc.moveDown(2);
    });

    // End the document
    doc.end();

    // Wait for the PDF to be fully generated and return the buffer
    return await pdfPromise;
}

export async function toggleSurveyStatus(surveyId: string) {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the user's UUID from the users table
    const userResult = await db`
        SELECT id FROM users 
        WHERE auth0_id = ${user.sub}
    ` as QueryResult<User>;

    if (!userResult?.length) {
        throw new Error(`User not found in database for auth0_id: ${user.sub}`);
    }

    const userId = userResult[0].id;

    // Verify that the survey belongs to the user
    const surveyResult = await db`
        SELECT * FROM surveys 
        WHERE id = ${surveyId} AND creator_id = ${userId}
    ` as QueryResult<Survey>;

    if (!surveyResult.length) {
        throw new Error("Survey not found or not authorized");
    }

    // Toggle the is_active status
    await db`
        UPDATE surveys 
        SET is_active = NOT is_active
        WHERE id = ${surveyId}
    `;
} 