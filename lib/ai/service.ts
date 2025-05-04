import { AI_PROVIDERS, AIService, AIConfig } from './types';
import { OpenAIService } from './providers/openai';
import { AnthropicService } from './providers/anthropic';
import { DeepSeekService } from './providers/deepseek';

export { AI_PROVIDERS };

export interface AIResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface AIService {
    chat(messages: { role: 'user' | 'assistant' | 'system'; content: string; }[], config?: AIConfig): Promise<AIResponse>;
}

export class AIServiceFactory {
    static create(provider: keyof typeof AI_PROVIDERS, config?: AIConfig): AIService {
        switch (provider) {
            case 'OPENAI':
                return new OpenAIService(config);
            case 'ANTHROPIC':
                return new AnthropicService(config);
            case 'DEEPSEEK':
                return new DeepSeekService(config);
            default:
                throw new Error(`Unsupported AI provider: ${provider}`);
        }
    }
}

// Base implementation that will be extended by each provider
export abstract class BaseAIService implements AIService {
    protected model: AIModel;
    protected temperature: number;
    protected maxTokens: number;
    protected apiKey: string;

    constructor(config?: AIConfig) {
        this.model = config?.model || DEFAULT_MODEL;
        this.temperature = config?.temperature || 0.7;
        this.maxTokens = config?.maxTokens || this.model.maxTokens;
        this.apiKey = config?.apiKey || process.env[`${this.model.provider.toUpperCase()}_API_KEY`] || '';
    }

    abstract chat(messages: { role: 'user' | 'assistant' | 'system'; content: string; }[], config?: AIConfig): Promise<AIResponse>;
} 