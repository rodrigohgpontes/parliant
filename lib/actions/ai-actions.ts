"use server";

import { AIServiceFactory } from "@/lib/ai/service";
import { AI_PROVIDERS } from "@/lib/ai/types";

interface GenerateSummaryResult {
    success: boolean;
    summary?: string;
    error?: string;
}

export async function generateSummary(conversation: any[]): Promise<GenerateSummaryResult> {
    try {
        const aiService = AIServiceFactory.create('OPENAI', {
            model: {
                name: "gpt-4.1-nano",
                provider: "openai",
                maxTokens: 4096
            },
            maxTokens: 300 // Limit token output
        });
        const messages = [
            {
                role: "system" as const,
                content: "You are a helpful assistant that summarizes conversations. Provide a concise summary of the key points discussed. Focus on summarizing the user messages, not the assistant messages."
            },
            {
                role: "user" as const,
                content: `Please summarize this conversation:\n\n${JSON.stringify(conversation, null, 2)}`
            }
        ];

        const response = await aiService.chat(messages);
        return { success: true, summary: response.content };
    } catch (error: any) {
        console.error('Error generating summary:', error);
        if (error.message.includes('API key')) {
            return {
                success: false,
                error: 'OpenAI API key is not configured. Please contact your administrator.'
            };
        }
        return {
            success: false,
            error: 'Failed to generate summary. Please try again later.'
        };
    }
}

export async function generateSurveySummary(objective: string, orientations?: string, responseSummaries: string[] = []): Promise<string | null> {
    try {
        const aiService = AIServiceFactory.create('OPENAI', {
            model: {
                name: "gpt-4.1-nano",
                provider: "openai",
                maxTokens: 4096
            },
            maxTokens: 1000 // Limit token output for concise summary
        });
        const messages = [
            {
                role: "system" as const,
                content: "Create extremely concise survey summaries. Focus only on key insights, patterns, and actionable findings. Use bullet points where appropriate. Maximum 150 words."
            },
            {
                role: "user" as const,
                content: `Synthesize these survey responses into a brief summary:
                - Objective: ${objective}
                ${orientations ? `- Orientations: ${orientations}` : ''}
                - Response Summaries:
                ${responseSummaries.map((summary, index) => `${index + 1}: ${summary}`).join('\n')}
                
                Focus only on the most important patterns and insights.`
            }
        ];

        const response = await aiService.chat(messages);
        return response.content;
    } catch (error) {
        console.error('Error generating survey summary:', error);
        return null;
    }
} 