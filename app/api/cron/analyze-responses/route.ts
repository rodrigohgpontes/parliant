import { NextResponse } from "next/server";
import { processUnanalyzedResponses } from "@/lib/response-analyzer";

export async function GET(request: Request) {
    try {
        // Verify the request is from the cron job
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await processUnanalyzedResponses();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in analyze-responses cron job:", error);
        return NextResponse.json(
            { error: "Failed to process responses" },
            { status: 500 }
        );
    }
} 