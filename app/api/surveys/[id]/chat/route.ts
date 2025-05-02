import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import OpenAI from "openai";
import { Deepseek } from "@/lib/deepseek";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const deepseek = new Deepseek({
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        const { messages } = await request.json();

        // Get survey context from database
        const surveyResult = await db.query(
            "SELECT title, description FROM surveys WHERE id = $1",
            [params.id]
        );

        if (surveyResult.rows.length === 0) {
            return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        }

        const survey = surveyResult.rows[0];

        // Prepare the system message with survey context
        const systemMessage = {
            role: "system",
            content: `You are an AI assistant helping with a survey titled "${survey.title}". 
      ${survey.description ? `Survey description: ${survey.description}` : ""}
      Your role is to engage in a natural conversation with the user, asking relevant follow-up questions and gathering detailed responses.
      Keep the conversation focused on the survey topic and maintain a friendly, professional tone.`,
        };

        // Try OpenAI first, fallback to Deepseek if it fails
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [systemMessage, ...messages],
                temperature: 0.7,
            });

            return NextResponse.json({
                response: completion.choices[0].message.content,
            });
        } catch (error) {
            console.error("OpenAI error, trying Deepseek:", error);

            const completion = await deepseek.createChatCompletion({
                model: "deepseek-chat",
                messages: [systemMessage, ...messages],
                temperature: 0.7,
            });

            return NextResponse.json({
                response: completion.choices[0].message.content,
            });
        }
    } catch (error) {
        console.error("Error in chat:", error);
        return NextResponse.json(
            { error: "Failed to process chat message" },
            { status: 500 }
        );
    }
} 