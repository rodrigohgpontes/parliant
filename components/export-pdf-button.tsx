"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { exportSurveyToPDF } from "@/lib/actions/server-data-actions";

interface ExportPDFButtonProps {
    surveyId: string;
    surveyObjective: string;
}

export function ExportPDFButton({ surveyId, surveyObjective }: ExportPDFButtonProps) {
    const handleExport = async () => {
        try {
            const pdfBuffer = await exportSurveyToPDF(surveyId);
            const blob = new Blob([pdfBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            // Clean the objective to make it filename-safe
            const safeFilename = surveyObjective
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            a.download = `${safeFilename}-survey.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting survey as PDF:", error);
        }
    };

    return (
        <Button onClick={handleExport} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
        </Button>
    );
} 