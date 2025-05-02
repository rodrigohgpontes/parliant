import { NextResponse } from 'next/server';
import { getAuthenticatedSurveys, createAuthenticatedSurvey } from '@/lib/actions/server-actions';

export async function GET() {
    try {
        const surveys = await getAuthenticatedSurveys();
        return NextResponse.json(surveys);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        await createAuthenticatedSurvey(formData);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
    }
} 