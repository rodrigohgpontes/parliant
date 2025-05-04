import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
    req: Request,
    { params }: { params: { id: string; responseId: string; }; }
) {
    try {
        const { conversation } = await req.json();
        const { id, responseId } = params;

        // Get the survey objective
        const surveyResult = await db`
            SELECT objective FROM surveys 
            WHERE id = ${id}
        `;

        if (!surveyResult?.length) {
            return NextResponse.json(
                { error: "Survey not found" },
                { status: 404 }
            );
        }

        const survey = surveyResult[0];

        // Ask AI to evaluate the conversation
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an expert at evaluating the quality and insightfulness of conversations. 
                    Evaluate the following conversation based on these criteria:
                    1. Depth of responses
                    2. Relevance to the survey objective: ${survey.objective}
                    3. Quality of insights provided
                    4. Engagement level
                    5. Clarity of communication
                    
                    Return your evaluation as a JSON object with two fields:
                    - insight_level: an integer between 0 and 10
                    - explanation: a brief explanation of the score
                    
                    Format your response exactly like this:
                    {"insight_level": 7, "explanation": "The conversation showed good depth and relevance to the objective, but could have explored more specific insights."}`,
                },
                {
                    role: "user",
                    content: JSON.stringify(conversation),
                },
            ],
        });

        if (!completion.choices[0]?.message?.content) {
            throw new Error("No content in AI response");
        }

        // Parse the AI's response
        const evaluation = JSON.parse(completion.choices[0].message.content);

        // Update the response with the insight level and explanation
        await db`
            UPDATE responses 
            SET insight_level = ${evaluation.insight_level},
                insight_explanation = ${evaluation.explanation}
            WHERE id = ${responseId}
        `;

        return NextResponse.json(evaluation);
    } catch (error) {
        console.error("Error evaluating conversation:", error);
        return NextResponse.json(
            { error: "Failed to evaluate conversation" },
            { status: 500 }
        );
    }
}