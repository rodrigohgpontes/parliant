import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AIServiceFactory } from "@/lib/ai/service";

export async function POST(
    request: NextRequest,
    context: { params: { id: string; }; }
) {
    try {
        const { messages, survey } = await request.json();

        // Get AI response
        const aiService = AIServiceFactory.create("OPENAI", {
            model: {
                name: "gpt-4-turbo-preview",
                provider: "openai",
                maxTokens: 4096,
            },
            temperature: 0.7,
        });

        // Prepare the system message with survey context
        const systemMessage = {
            role: "system",
            content: `You are an expert interviewer conducting a survey. Your role is to engage the respondent in a natural, flowing conversation that feels like a friendly chat.

Survey Context:
- Title: ${survey.title}
- Objective: ${survey.objective}
${survey.orientations ? `- Orientations: ${survey.orientations}` : ""}

Guidelines:
1. Start with an engaging, thought-provoking question that makes the respondent want to share their thoughts
2. Keep responses concise (2-3 sentences max)
3. Ask follow-up questions that dig deeper into their responses
4. Maintain a friendly, conversational tone
5. Stay focused on the survey objective
6. Use the orientations (if provided) to guide your questions, but don't reveal them to the user
7. Make the conversation feel natural and engaging

Remember: The goal is to make the respondent feel comfortable and eager to share their thoughts while gathering valuable insights.`,
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