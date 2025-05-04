import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        const { id } = await params;
        const { respondent_name, respondent_email, conversation } = await request.json();

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

        // Create response
        const response = await db`
            INSERT INTO responses (
                survey_id,
                respondent_name,
                respondent_email,
                conversation,
                created_at
            )
            VALUES (
                ${id},
                ${respondent_name},
                ${respondent_email},
                ${JSON.stringify(conversation)}::jsonb,
                ${new Date()}
            )
            RETURNING id
        `;

        return NextResponse.json({ id: response[0].id });
    } catch (error) {
        console.error("Error creating response:", error);
        return NextResponse.json(
            { error: "Failed to create response" },
            { status: 500 }
        );
    }
} 