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
                maxTokens: 4096,
            },
            temperature: 0.7,
        });

        const messages = [
            {
                role: "system" as const,
                content: "You are an expert at creating clear and concise guidelines for AI assistants conducting surveys. Focus on making the guidelines actionable and easy to follow."
            },
            {
                role: "user" as const,
                content: guidelines.trim()
                    ? `Improve these guidelines for an AI assistant conducting a survey about: "${objective}"\n\nCurrent guidelines:\n${guidelines}\n\nMake them more concise and format them as simple bullet points using dashes. No markdown or fancy titles.`
                    : `Create clear and concise guidelines for an AI assistant conducting a survey about: "${objective}"\n\nFormat them as simple bullet points using dashes. No markdown or fancy titles.`
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