import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0-client';
import { db } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await auth0.getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.sub;

        // Get current month's usage
        const currentUsage = await db`
      SELECT 
        COUNT(DISTINCT s.id) as surveys,
        COUNT(r.id) as responses
      FROM surveys s
      LEFT JOIN responses r ON s.id = r.survey_id
      WHERE s.user_id = ${userId}
      AND s.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;

        // Get monthly statistics for the last 6 months
        const monthlyStats = await db`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon YYYY') as month,
        COUNT(DISTINCT s.id) as surveys,
        COUNT(r.id) as responses
      FROM surveys s
      LEFT JOIN responses r ON s.id = r.survey_id
      WHERE s.user_id = ${userId}
      AND s.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
      GROUP BY DATE_TRUNC('month', s.created_at)
      ORDER BY DATE_TRUNC('month', s.created_at)
    `;

        return NextResponse.json({
            surveys: currentUsage[0]?.surveys || 0,
            responses: currentUsage[0]?.responses || 0,
            monthlyData: monthlyStats
        });
    } catch (error) {
        console.error('Error fetching usage statistics:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 