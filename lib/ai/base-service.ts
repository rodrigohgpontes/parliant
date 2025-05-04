import { AIModel, DEFAULT_MODEL, AIService, AIConfig, AIResponse } from './types';

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