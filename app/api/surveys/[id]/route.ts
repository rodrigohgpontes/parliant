import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateAuthenticatedSurvey, deleteAuthenticatedSurvey } from '@/lib/actions/server-actions';

export async function GET(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    const { id } = await params;

    try {
        const result = await db`
            SELECT id, objective, orientations, allow_anonymous, first_question, max_questions, max_characters, is_active
            FROM surveys 
            WHERE id = ${id}
        `;

        if (!result?.length) {
            return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("Error fetching survey:", error);
        return NextResponse.json(
            { error: "Failed to fetch survey" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    const { id } = await params;

    try {
        const formData = await request.formData();
        await updateAuthenticatedSurvey(id, formData);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    const { id } = await params;

    try {
        await deleteAuthenticatedSurvey(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 });
    }
} 