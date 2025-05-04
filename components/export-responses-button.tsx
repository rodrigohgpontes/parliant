"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportResponsesToCSV } from "@/lib/actions/server-data-actions";

interface ExportResponsesButtonProps {
    surveyId: string;
    surveyObjective: string;
}

export function ExportResponsesButton({ surveyId, surveyObjective }: ExportResponsesButtonProps) {
    const handleExport = async () => {
        try {
            const csvData = await exportResponsesToCSV(surveyId);
            const blob = new Blob([csvData], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            // Clean the objective to make it filename-safe
            const safeFilename = surveyObjective
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            a.download = `${safeFilename}-responses.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting responses:", error);
        }
    };

    return (
        <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Responses
        </Button>
    );
} 