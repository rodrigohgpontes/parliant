import { NextResponse } from "next/server";
import { AIServiceFactory } from "@/lib/ai/service";

export async function POST(request: Request) {
    try {
        const { objective, guidelines, isNew } = await request.json();

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
                maxTokens: 1200,
            },
            temperature: 0.7,
        });

        const messages = [
            {
                role: "system" as const,
                content: `You are an expert at creating clear and concise guidelines for AI assistants conducting surveys. Your guidelines should:
- Describe the target audience and their context
- Specify the type of information to collect
- Include specific topics or areas to explore
- Set expectations for the conversation style and depth
- Be actionable and easy to follow
- Use a clear, professional tone
- Format as simple bullet points using dashes

Focus on making the guidelines practical and effective for gathering meaningful insights.`
            },
            {
                role: "user" as const,
                content: guidelines.trim()
                    ? `Improve these guidelines for an AI assistant conducting a survey about: "${objective}"

Current guidelines:
${guidelines}

Follow these guidelines:
- Describe the target audience and their context
- Specify the type of information to collect
- Include specific topics or areas to explore
- Set expectations for the conversation style and depth
- Make them actionable and easy to follow
- Use a clear, professional tone
- Format as simple bullet points using dashes

Return ONLY the improved guidelines without any additional text or formatting.`
                    : `Create guidelines for an AI assistant conducting a survey about: "${objective}"

Follow these guidelines:
- Describe the target audience and their context
- Specify the type of information to collect
- Include specific topics or areas to explore
- Set expectations for the conversation style and depth
- Make them actionable and easy to follow
- Use a clear, professional tone
- Format as simple bullet points using dashes

Return ONLY the guidelines without any additional text or formatting.`
            }
        ];

        const response = await aiService.chat(messages);
        const improvedGuidelines = response.content.trim();

        return NextResponse.json({ improvedGuidelines });
    } catch (error) {
        console.error("Error improving guidelines:", error);
        return NextResponse.json(
            { error: "Failed to improve guidelines" },
            { status: 500 }
        );
    }
} 