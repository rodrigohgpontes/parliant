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
        const aiService = AIServiceFactory.create('OPENAI');
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
        const aiService = AIServiceFactory.create('OPENAI');
        const messages = [
            {
                role: "system" as const,
                content: "You are a helpful assistant that creates concise and informative survey summaries. Focus on synthesizing the key insights from the response summaries."
            },
            {
                role: "user" as const,
                content: `Please create a comprehensive summary for this survey based on the following information:
                Survey Objective: ${objective}
                ${orientations ? `Orientations: ${orientations}` : ''}
                Response Summaries:
                ${responseSummaries.map((summary, index) => `Response ${index + 1}:\n${summary}`).join('\n\n')}
                Please provide a synthesis of the key insights and patterns from these responses.
                `
            }
        ];

        const response = await aiService.chat(messages);
        return response.content;
    } catch (error) {
        console.error('Error generating survey summary:', error);
        return null;
    }
} 