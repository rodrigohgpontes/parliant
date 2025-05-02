import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { updateAuthenticatedSurvey, deleteAuthenticatedSurvey } from '@/lib/actions/server-actions';

export async function GET(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        const result = await query(
            "SELECT id, title, description FROM surveys WHERE id = $1 AND is_active = true",
            [params.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
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
    try {
        const formData = await request.formData();
        await updateAuthenticatedSurvey(params.id, formData);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        await deleteAuthenticatedSurvey(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 });
    }
} 