import { db } from "@/lib/db/index";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeResponse(responseId: number) {
    const response = await db`
        SELECT * FROM responses 
        WHERE id = ${responseId}
    `;

    if (!response?.length) {
        throw new Error("Response not found");
    }

    const content = response[0].data.content;

    const completion = await openai.chat.completions.create({
        model: "o3",
        max_completion_tokens: 300,
        messages: [
            {
                role: "system",
                content: "You are a survey response analyzer. Analyze the following response and provide insights.",
            },
            {
                role: "user",
                content: content,
            },
        ],
    });

    const analysis = completion.choices[0].message.content;

    await db`
        UPDATE responses 
        SET analysis = ${analysis}
        WHERE id = ${responseId}
    `;

    return analysis;
}

export async function analyzeSurveyResponses(surveyId: number) {
    const responses = await db`
        SELECT * FROM responses 
        WHERE survey_id = ${surveyId}
        ORDER BY created_at DESC
    `;

    if (!responses?.length) {
        throw new Error("No responses found");
    }

    const analysisPromises = responses.map((response) => analyzeResponse(response.id));
    const analyses = await Promise.all(analysisPromises);

    return analyses;
}

export async function getSurveyInsights(surveyId: number) {
    const responses = await db`
        SELECT * FROM responses 
        WHERE survey_id = ${surveyId}
        ORDER BY created_at DESC
    `;

    if (!responses?.length) {
        throw new Error("No responses found");
    }

    const content = responses.map((r) => r.data.content).join("\n\n");

    const completion = await openai.chat.completions.create({
        model: "o3",
        max_completion_tokens: 300,
        messages: [
            {
                role: "system",
                content: "You are a survey insights analyzer. Analyze the following responses and provide key insights and trends.",
            },
            {
                role: "user",
                content: content,
            },
        ],
    });

    return completion.choices[0].message.content;
}

export async function processUnanalyzedResponses() {
    try {
        // Get unanalyzed responses
        const result = await db`
            SELECT id FROM responses 
            WHERE analysis IS NULL 
            ORDER BY completed_at ASC 
            LIMIT 10
        `;

        // Process each response
        for (const row of result) {
            try {
                await analyzeResponse(row.id);
            } catch (error) {
                console.error(`Error processing response ${row.id}:`, error);
            }
        }
    } catch (error) {
        console.error("Error processing unanalyzed responses:", error);
    }
} 