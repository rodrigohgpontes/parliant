import { BaseAIService, AIConfig } from "../base-service";
import { AIModel } from "../types";
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicService extends BaseAIService {
    private client: Anthropic;

    constructor(config?: AIConfig) {
        super(config);
        this.client = new Anthropic({
            apiKey: this.apiKey,
        });
    }

    async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string; }[], config?: AIConfig): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number; }; }> {
        try {
            // Convert messages to Anthropic's format
            const anthropicMessages = messages.map(msg => ({
                role: msg.role === 'system' ? 'assistant' : msg.role,
                content: msg.content,
            }));

            const response = await this.client.messages.create({
                model: config?.model?.name || this.model.name,
                messages: anthropicMessages,
                temperature: config?.temperature || this.temperature,
                max_tokens: config?.maxTokens || this.maxTokens,
            });

            return {
                content: response.content[0].text,
                usage: {
                    promptTokens: response.usage.input_tokens,
                    completionTokens: response.usage.output_tokens,
                    totalTokens: response.usage.input_tokens + response.usage.output_tokens,
                },
            };
        } catch (error) {
            console.error('Anthropic API Error:', error);
            throw new Error('Failed to generate response from Anthropic');
        }
    }
} 