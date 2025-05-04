import { BaseAIService, AIConfig } from "../base-service";
import { AIModel } from "../types";

export class DeepSeekService extends BaseAIService {
    constructor(config?: AIConfig) {
        super(config);
    }

    async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string; }[], config?: AIConfig): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number; }; }> {
        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: config?.model?.name || this.model.name,
                    messages: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                    temperature: config?.temperature || this.temperature,
                    max_tokens: config?.maxTokens || this.maxTokens,
                }),
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                content: data.choices[0].message.content,
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                },
            };
        } catch (error) {
            console.error('DeepSeek API Error:', error);
            throw new Error('Failed to generate response from DeepSeek');
        }
    }
} 