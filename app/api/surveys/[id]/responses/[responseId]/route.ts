import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string; responseId: string; }; }
) {
    try {
        const { id, responseId } = await params;
        const body = await request.json();
        const { conversation, completed_at, respondent_name, respondent_email } = body;

        // Check if survey exists and is active
        const survey = await db`
            SELECT * FROM surveys 
            WHERE id = ${id} AND is_active = true
        `;

        if (!survey?.length) {
            return NextResponse.json(
                { error: "Survey not found or not active" },
                { status: 404 }
            );
        }

        // Check if response exists
        const response = await db`
            SELECT * FROM responses 
            WHERE id = ${responseId} AND survey_id = ${id}
        `;

        if (!response?.length) {
            return NextResponse.json(
                { error: "Response not found" },
                { status: 404 }
            );
        }

        // Prepare the update data
        const updateData = {
            conversation: conversation ? conversation : response[0].conversation,
            completed_at: completed_at ? new Date(completed_at) : response[0].completed_at,
            respondent_name: respondent_name !== undefined ? respondent_name : response[0].respondent_name,
            respondent_email: respondent_email !== undefined ? respondent_email : response[0].respondent_email,
            created_at: new Date()
        };

        // Update response
        const updateQuery = db`
            UPDATE responses 
            SET 
                conversation = ${JSON.stringify(updateData.conversation)},
                completed_at = ${updateData.completed_at},
                respondent_name = ${updateData.respondent_name},
                respondent_email = ${updateData.respondent_email},
                created_at = ${updateData.created_at}
            WHERE id = ${responseId} AND survey_id = ${id}
            RETURNING *
        `;

        const result = await updateQuery;

        if (!result?.length) {
            return NextResponse.json(
                { error: "Failed to update response" },
                { status: 500 }
            );
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("Error updating response:", error);
        return NextResponse.json(
            { error: "Failed to update response" },
            { status: 500 }
        );
    }
};