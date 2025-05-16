import { NextResponse } from "next/server";
import { AIServiceFactory } from "@/lib/ai/service";

export async function POST(request: Request) {
    try {
        const { objective, guidelines } = await request.json();

        if (!objective) {
            return NextResponse.json(
                { error: "Learning objective is required" },
                { status: 400 }
            );
        }

        const aiService = AIServiceFactory.create("OPENAI", {
            model: {
                name: "gpt-4-turbo-preview",
                provider: "openai",
                maxTokens: 500,
            },
            temperature: 0.7,
        });

        const messages = [
            {
                role: "system" as const,
                content: `You are an expert at creating engaging, open-ended first questions for surveys. Your task is to create an effective opening question that:
- Directly relates to the learning objective
- Is open-ended and encourages detailed responses
- Is conversational and approachable
- Is specific enough to elicit meaningful insights
- Is phrased in second person (addressing the respondent directly)
- Is concise (ideally no more than 1-2 sentences)

Return ONLY the question without any additional text, quotes, or context.`
            },
            {
                role: "user" as const,
                content: `Create an engaging first question for a survey with this learning objective:
"${objective}"

${guidelines ? `The survey has the following guidelines:
${guidelines}` : ''}

The question should:
- Directly relate to the learning objective
- Be open-ended and encourage detailed responses
- Be conversational and approachable
- Be specific enough to elicit meaningful insights
- Be phrased in second person (addressing the respondent directly)
- Be concise (ideally no more than 1-2 sentences)

Return ONLY the question without any additional text or quotes.`
            }
        ];

        const response = await aiService.chat(messages);
        const firstQuestion = response.content.trim();

        // Clean up the response by removing any quotes or prefixes
        const cleanQuestion = firstQuestion
            .replace(/^(question|prompt|first question):\s*/i, '')
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .trim();

        return NextResponse.json({ firstQuestion: cleanQuestion });
    } catch (error) {
        console.error("Error generating first question:", error);
        return NextResponse.json(
            { error: "Failed to generate first question" },
            { status: 500 }
        );
    }
} 