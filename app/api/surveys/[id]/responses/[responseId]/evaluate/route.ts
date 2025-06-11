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
        const { id, responseId } = await params;

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
            model: "o3",
            max_completion_tokens: 100, // Limit token output for concise response
            messages: [
                {
                    role: "system",
                    content: `Evaluate the insightfulness of user answers in this conversation based on:
1. Depth of responses
2. Relevance to objective: ${survey.objective}
3. Quality of insights
4. Engagement level
5. Communication clarity

Be strict with the evaluation. Don't be afraid to give a low score if the answers are not good.

Return only JSON with:
- insight_level: integer 0-10
- explanation: brief explanation (max 20 words)

Example: {"insight_level": 6, "explanation": "Good depth on main topics, but missed opportunities for specific details."}`,
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