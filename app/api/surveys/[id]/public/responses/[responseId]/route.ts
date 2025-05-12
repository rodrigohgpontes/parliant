import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: { id: string; responseId: string; }; }
) {
    try {
        const { id, responseId } = params;

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

        // Get the response
        const response = await db`
            SELECT id, conversation, created_at, completed_at
            FROM responses 
            WHERE id = ${responseId} AND survey_id = ${id}
        `;

        if (!response?.length) {
            return NextResponse.json(
                { error: "Response not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(response[0]);
    } catch (error) {
        console.error("Error fetching response:", error);
        return NextResponse.json(
            { error: "Failed to fetch response" },
            { status: 500 }
        );
    }
} 