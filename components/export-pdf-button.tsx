"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { exportSurveyToPDF } from "@/lib/actions/server-data-actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ExportPDFButtonProps {
    surveyId: string;
    surveyObjective: string;
}

export function ExportPDFButton({ surveyId, surveyObjective }: ExportPDFButtonProps) {
    const [includeInvalid, setIncludeInvalid] = useState(true);
    const [includeIncomplete, setIncludeIncomplete] = useState(true);

    const handleExport = async () => {
        try {
            const pdfBuffer = await exportSurveyToPDF(surveyId, includeInvalid, includeIncomplete);
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 space-y-2">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="include-invalid-pdf"
                            checked={includeInvalid}
                            onCheckedChange={setIncludeInvalid}
                        />
                        <Label htmlFor="include-invalid-pdf">Include invalid responses</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="include-incomplete-pdf"
                            checked={includeIncomplete}
                            onCheckedChange={setIncludeIncomplete}
                        />
                        <Label htmlFor="include-incomplete-pdf">Include incomplete responses</Label>
                    </div>
                </div>
                <DropdownMenuItem onClick={handleExport}>
                    Export as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 