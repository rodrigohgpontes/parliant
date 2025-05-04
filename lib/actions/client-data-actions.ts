"use client";

import { updateResponseSummary } from "./server-data-actions";

export async function handleSummaryGeneration(responseId: string, summary: string) {
    try {
        await updateResponseSummary(responseId, summary);
        return { success: true };
    } catch (error) {
        console.error("Error updating summary:", error);
        return { success: false, error: "Failed to update summary" };
    }
} 