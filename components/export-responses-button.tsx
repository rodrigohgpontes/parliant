"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportResponsesToCSV } from "@/lib/actions/server-data-actions";
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

interface ExportResponsesButtonProps {
    surveyId: string;
    surveyObjective: string;
}

export function ExportResponsesButton({ surveyId, surveyObjective }: ExportResponsesButtonProps) {
    const [includeInvalid, setIncludeInvalid] = useState(true);
    const [includeIncomplete, setIncludeIncomplete] = useState(true);

    const handleExport = async () => {
        try {
            const csvData = await exportResponsesToCSV(surveyId, includeInvalid, includeIncomplete);
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Responses
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 space-y-2">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="include-invalid"
                            checked={includeInvalid}
                            onCheckedChange={setIncludeInvalid}
                        />
                        <Label htmlFor="include-invalid">Include invalid responses</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="include-incomplete"
                            checked={includeIncomplete}
                            onCheckedChange={setIncludeIncomplete}
                        />
                        <Label htmlFor="include-incomplete">Include incomplete responses</Label>
                    </div>
                </div>
                <DropdownMenuItem onClick={handleExport}>
                    Export as CSV
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 