import { BaseAIService, AIConfig } from "../base-service";
import { AIModel, AVAILABLE_MODELS } from "../types";
import OpenAI from "openai";

export class OpenAIService extends BaseAIService {
    private client: OpenAI;

    constructor(config?: AIConfig) {
        super(config);

        if (!this.apiKey) {
            throw new Error('OpenAI API key is required. Please set the OPENAI_API_KEY environment variable.');
        }

        // Validate model name
        const availableModels = AVAILABLE_MODELS.OPENAI.map(m => m.name);
        if (!availableModels.includes(this.model.name)) {
            throw new Error(`Invalid OpenAI model: ${this.model.name}. Available models: ${availableModels.join(', ')}`);
        }

        this.client = new OpenAI({
            apiKey: this.apiKey,
            dangerouslyAllowBrowser: false, // This is a server-side service
        });
    }

    async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string; }[], config?: AIConfig): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number; }; }> {
        try {
            const modelName = config?.model?.name || this.model.name;

            // Validate model name again in case it was changed in the config
            const availableModels = AVAILABLE_MODELS.OPENAI.map(m => m.name);
            if (!availableModels.includes(modelName)) {
                throw new Error(`Invalid OpenAI model: ${modelName}. Available models: ${availableModels.join(', ')}`);
            }

            const response = await this.client.chat.completions.create({
                model: modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: config?.temperature || this.temperature,
                max_tokens: config?.maxTokens || this.maxTokens,
            });

            return {
                content: response.choices[0].message.content || '',
                usage: {
                    promptTokens: response.usage?.prompt_tokens || 0,
                    completionTokens: response.usage?.completion_tokens || 0,
                    totalTokens: response.usage?.total_tokens || 0,
                },
            };
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your environment variables.');
            }
            if (error.status === 400 && error.message.includes('model')) {
                throw new Error(`Invalid OpenAI model. Please check the model name and try again.`);
            }
            throw new Error(`Failed to generate response from OpenAI: ${error.message}`);
        }
    }
} 