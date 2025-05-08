import { NextResponse } from "next/server";
import { AIServiceFactory } from "@/lib/ai/service";

export async function POST(request: Request) {
    try {
        const { objective } = await request.json();

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
                maxTokens: 4096,
            },
            temperature: 0.7,
        });

        const messages = [
            {
                role: "system" as const,
                content: "You are an expert at crafting clear, specific, and engaging learning objectives for surveys. Write in a conversational, informal tone that feels natural and approachable. Keep responses concise and to the point - aim for 1-2 short sentences maximum. Your goal is to rephrase the given objective to make it more focused and likely to yield valuable insights. Return ONLY the rephrased objective without any additional text, labels, or context. Do not use quotes or formal language.",
            },
            {
                role: "user" as const,
                content: `Improve this learning objective to make it more specific, engaging, and likely to lead to interesting survey responses. Keep it very concise - 1-2 short sentences maximum. Write in a conversational, informal tone. Return ONLY the improved version without any additional text or quotes:

${objective}`,
            },
        ];

        const response = await aiService.chat(messages);
        const rephrasedObjective = response.content.trim();

        // Remove any potential prefixes and quotes
        const cleanObjective = rephrasedObjective
            .replace(/^(rephrased|improved|new):\s*/i, '')
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .replace(/["']/g, '') // Remove any remaining quotes
            .trim();

        return NextResponse.json({ rephrasedObjective: cleanObjective });
    } catch (error) {
        console.error("Error rephrasing objective:", error);
        return NextResponse.json(
            { error: "Failed to rephrase objective" },
            { status: 500 }
        );
    }
} 