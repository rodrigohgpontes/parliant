export interface AIModel {
    name: string;
    provider: 'openai' | 'anthropic' | 'deepseek';
    maxTokens: number;
}

export interface AIResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface AIConfig {
    model?: AIModel;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
}

export interface AIService {
    chat(messages: { role: 'user' | 'assistant' | 'system'; content: string; }[], config?: AIConfig): Promise<AIResponse>;
}

export const AI_PROVIDERS = {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    DEEPSEEK: 'deepseek',
} as const;

// Default model configurations
export const DEFAULT_MODEL: AIModel = {
    name: 'o3',
    provider: 'openai',
    maxTokens: 8192,
};

// Available models for each provider
export const AVAILABLE_MODELS: Record<keyof typeof AI_PROVIDERS, AIModel[]> = {
    OPENAI: [
        {
            name: 'o3',
            provider: 'openai',
            maxTokens: 8192,
        },
        {
            name: 'gpt-3.5-turbo',
            provider: 'openai',
            maxTokens: 4096,
        },
        {
            name: 'gpt-4',
            provider: 'openai',
            maxTokens: 8192,
        },
        {
            name: 'gpt-4-turbo-preview',
            provider: 'openai',
            maxTokens: 128000,
        },
        {
            name: 'gpt-4.1-nano',
            provider: 'openai',
            maxTokens: 8192,
        },
    ],
    ANTHROPIC: [
        {
            name: 'claude-3-opus-20240229',
            provider: 'anthropic',
            maxTokens: 200000,
        },
        {
            name: 'claude-3-sonnet-20240229',
            provider: 'anthropic',
            maxTokens: 200000,
        },
        {
            name: 'claude-2.1',
            provider: 'anthropic',
            maxTokens: 100000,
        },
    ],
    DEEPSEEK: [
        {
            name: 'deepseek-chat',
            provider: 'deepseek',
            maxTokens: 32768,
        },
    ],
}; 