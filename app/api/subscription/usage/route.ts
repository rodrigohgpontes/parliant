import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, return mock usage data
    return NextResponse.json({
      surveys: 0,
      responses: 0,
      monthlyData: [
        { month: 'Jan', surveys: 0, responses: 0 },
        { month: 'Feb', surveys: 0, responses: 0 },
        { month: 'Mar', surveys: 0, responses: 0 },
        { month: 'Apr', surveys: 0, responses: 0 },
        { month: 'May', surveys: 0, responses: 0 },
        { month: 'Jun', surveys: 0, responses: 0 }
      ]
    });
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 