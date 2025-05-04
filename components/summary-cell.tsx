"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateSummary } from "@/lib/actions/ai-actions";
import { handleSummaryGeneration } from "@/lib/actions/client-data-actions";
import { Loader2 } from "lucide-react";

interface SummaryCellProps {
    summary: string | null;
    conversation: any[];
    responseId: string;
    isGenerating?: boolean;
}

export function SummaryCell({ summary, conversation, responseId, isGenerating = false }: SummaryCellProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSummaryHandler = async () => {
        setIsGeneratingLocal(true);
        setError(null);
        try {
            const result = await generateSummary(conversation);
            if (!result.success || !result.summary) {
                setError(result.error || "Failed to generate summary");
                return;
            }

            const updateResult = await handleSummaryGeneration(responseId, result.summary);
            if (!updateResult.success) {
                setError(updateResult.error || "Failed to update summary");
                return;
            }

            // Refresh the page to show the new summary
            router.refresh();
        } catch (error) {
            console.error('Error generating summary:', error);
            setError("Failed to generate summary");
        } finally {
            setIsGeneratingLocal(false);
        }
    };

    if (!summary) {
        return (
            <div className="flex flex-col gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={generateSummaryHandler}
                    disabled={isGenerating || isGeneratingLocal}
                >
                    {isGenerating || isGeneratingLocal ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        "Generate AI Summary"
                    )}
                </Button>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }

    return (
        <>
            <Button
                variant="ghost"
                className="text-left p-0 h-auto hover:bg-transparent w-full"
                onClick={() => setIsModalOpen(true)}
            >
                <span className="line-clamp-2 text-ellipsis overflow-hidden">
                    {summary}
                </span>
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Response Summary</DialogTitle>
                    </DialogHeader>
                    <div className="bg-muted/50 rounded-lg p-6">
                        <p className="whitespace-pre-wrap">
                            {summary}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 