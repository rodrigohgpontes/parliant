import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        const body = await request.json();
        const { conversation, completed_at } = body;

        // Check if survey exists and is active
        const survey = await db`
      SELECT * FROM surveys 
      WHERE id = ${params.id} AND is_active = true
    `;

        if (!survey?.length) {
            return NextResponse.json(
                { error: "Survey not found" },
                { status: 404 }
            );
        }

        // Create response
        await db`
      INSERT INTO responses (
        survey_id,
        conversation,
        completed_at,
        created_at
      )
      VALUES (
        ${params.id},
        ${JSON.stringify(conversation)},
        ${completed_at},
        ${new Date()}
      )
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting response:", error);
        return NextResponse.json(
            { error: "Failed to submit response" },
            { status: 500 }
        );
    }
} 