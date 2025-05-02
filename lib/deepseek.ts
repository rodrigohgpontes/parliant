export class Deepseek {
    private apiKey: string;
    private baseUrl = "https://api.deepseek.com/v1";

    constructor(config: { apiKey: string; }) {
        this.apiKey = config.apiKey;
    }

    async createChatCompletion(config: {
        model: string;
        messages: any[];
        temperature?: number;
    }) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: config.messages,
                temperature: config.temperature || 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`Deepseek API error: ${response.statusText}`);
        }

        return response.json();
    }
} 