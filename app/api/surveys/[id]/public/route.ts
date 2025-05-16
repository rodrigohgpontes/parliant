import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    const { id } = await params;

    try {
        // First check if the survey exists at all
        const surveyExists = await db`
      SELECT id, is_active 
      FROM surveys 
      WHERE id = ${id}
    `;

        if (!surveyExists?.length) {
            return NextResponse.json(
                { error: "Survey not found" },
                { status: 404 }
            );
        }

        // Then check if it's active
        if (!surveyExists[0].is_active) {
            return NextResponse.json(
                { error: "Survey is not active" },
                { status: 403 }
            );
        }

        // Get the full survey data
        const survey = await db`
      SELECT id, objective, max_questions, max_characters 
      FROM surveys 
      WHERE id = ${id}
    `;

        // Return only the necessary fields for public access
        const publicSurvey = {
            id: survey[0].id,
            objective: survey[0].objective,
            max_questions: survey[0].max_questions,
            max_characters: survey[0].max_characters,
        };

        return NextResponse.json(publicSurvey);
    } catch (error) {
        console.error("Error fetching survey:", error);
        return NextResponse.json(
            { error: "Failed to fetch survey" },
            { status: 500 }
        );
    }
} 