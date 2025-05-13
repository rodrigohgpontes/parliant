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

        // Check if any message exceeds the max_characters limit
        if (conversation && survey[0].max_characters) {
            // Check only user messages for character limits
            const userMessages = conversation.filter((msg: any) => msg.role === 'user');
            const messageThatExceedsLimit = userMessages.find((msg: any) =>
                msg.content.length > survey[0].max_characters
            );

            if (messageThatExceedsLimit) {
                return NextResponse.json(
                    {
                        error: "Message exceeds character limit",
                        character_limit_exceeded: true,
                        max_characters: survey[0].max_characters,
                        message_length: messageThatExceedsLimit.content.length
                    },
                    { status: 403 }
                );
            }
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