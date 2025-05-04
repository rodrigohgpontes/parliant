import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AIServiceFactory } from "@/lib/ai/service";

export async function POST(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        const { messages, survey } = await request.json();

        // Verify survey exists and is active
        const surveyResult = await db`
      SELECT * FROM surveys 
      WHERE id = ${params.id} AND is_active = true
    `;

        if (!surveyResult?.length) {
            return NextResponse.json(
                { error: "Survey not found or not active" },
                { status: 404 }
            );
        }

        // Get AI response
        const aiService = AIServiceFactory.create("OPENAI");
        const response = await aiService.chat([
            {
                role: "system",
                content: `You are conducting a survey. Follow these rules strictly:
1. Always ask clear, specific questions
2. Keep all messages short and concise (max 2-3 sentences)
3. Stay focused on the survey objective: ${survey.objective}
4. Guide the conversation to gather complete information
5. Maximum questions: ${survey.max_questions || "No limit"}
6. Maximum characters per message: ${survey.max_characters || "No limit"}

Do not explain the rules to the user. Just follow them.`
            },
            ...messages
        ]);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in chat route:", error);
        return NextResponse.json(
            { error: "Failed to process chat message" },
            { status: 500 }
        );
    }
} 