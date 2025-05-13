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
                maxTokens: 500,
            },
            temperature: 0.7,
        });

        const messages = [
            {
                role: "system" as const,
                content: `You are an expert at crafting clear, specific, and engaging learning objectives for surveys. Your objectives should:
- Be specific about the knowledge or insights to be gained
- Focus on what to learn, not how the information will be used
- Be clear and concise, but detailed enough to guide the AI
- Use a professional, but conversational, question-based format in second person voice (addressing the respondent directly)
- Be 1-2 short sentences maximum

Return ONLY the rephrased objective without any additional text, labels, or context. Format it as a clear, specific question that addresses the respondent directly.`,
            },
            {
                role: "user" as const,
                content: `Rephrase this learning objective following these guidelines:
- Make it specific about the knowledge or insights to be gained
- Focus on what to learn, not how the information will be used
- Keep it clear and concise, but detailed enough to guide the AI
- Format it as a clear, specific question in second person voice (addressing the respondent directly)
- Keep it to 1-2 short sentences maximum

Return ONLY the improved version without any additional text or quotes:

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