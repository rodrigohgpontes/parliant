import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";

export async function POST(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        const { response } = await request.json();

        const result = await query(
            `INSERT INTO responses (survey_id, data, completed_at)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [params.id, { response }, new Date().toISOString()]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error submitting response:", error);
        return NextResponse.json(
            { error: "Failed to submit response" },
            { status: 500 }
        );
    }
} 