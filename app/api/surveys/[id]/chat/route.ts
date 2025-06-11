import { NextResponse } from "next/server";
import { AIServiceFactory } from "@/lib/ai/service";

export async function POST(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        const { messages, survey } = await request.json();

        // Get AI response
        const aiService = AIServiceFactory.create("OPENAI", {
            model: {
                name: "o3",
                provider: "openai",
                maxTokens: 4096,
            },
            temperature: 0.7,
            maxTokens: 500 // Limit token output for concise responses
        });

        // Prepare the system message with survey context
        const systemMessage = {
            role: "system",
            content: `You're conducting a survey with these strict guidelines:

Survey Context:
- Objective: ${survey.objective}
${survey.orientations ? `- Orientations: ${survey.orientations}` : ""}

Rules:
1. Be extremely concise - limit responses to 1-2 short sentences
2. Ask direct, specific questions using "you" and "your"
3. Never acknowledge responses with "thank you" or "I understand"
4. Go straight to the next question without preamble
5. If a topic has been discussed, switch to a new angle or related topic
6. Each question should build on previous insights while exploring new areas
7. Use second person voice consistently

Your goal is to gather rich insights through the shortest possible exchanges. Don't explain these rules to the user.`,
        };

        const response = await aiService.chat([systemMessage, ...messages]);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in chat route:", error);
        return NextResponse.json(
            { error: "Failed to process chat message" },
            { status: 500 }
        );
    }
} 