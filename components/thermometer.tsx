import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";

interface ThermometerProps {
    value: number | null;
    max: number;
    explanation?: string;
    className?: string;
}

export function Thermometer({ value, max, explanation, className }: ThermometerProps) {
    const percentage = value !== null ? (value / max) * 100 : 0;
    const displayValue = value !== null ? Math.round(value) : "—";
    const colorIntensity = value !== null ? Math.min(1, value / max) : 0;

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Insight Level</span>
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className={cn(
                                "h-4 w-4 cursor-help",
                                explanation ? "text-coral" : "text-muted-foreground"
                            )} />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                            <div className="text-sm">
                                {explanation ? (
                                    <>
                                        <p className="font-medium mb-2">Current Evaluation:</p>
                                        <p className="text-coral">{explanation}</p>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            The Insight Level measures how valuable and informative the conversation is for the survey objective.
                                            It considers:
                                        </p>
                                        <ul className="mt-2 list-disc list-inside">
                                            <li>Depth of responses</li>
                                            <li>Relevance to the survey objective</li>
                                            <li>Quality of insights provided</li>
                                            <li>Engagement level</li>
                                            <li>Clarity of communication</li>
                                        </ul>
                                        <p className="mt-2">
                                            The level updates after each response, ranging from 0 (minimal insight) to 10 (exceptional insight).
                                        </p>
                                    </>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div className="relative w-4 h-48 bg-muted rounded-full overflow-hidden">
                <div
                    className="absolute bottom-0 w-full transition-all duration-500"
                    style={{
                        height: `${percentage}%`,
                        backgroundColor: `rgba(255, 127, 80, ${0.3 + colorIntensity * 0.7})`
                    }}
                />
                <div
                    className="absolute bottom-0 w-full h-4 rounded-full"
                    style={{
                        backgroundColor: `rgba(255, 127, 80, ${0.3 + colorIntensity * 0.7})`
                    }}
                />
            </div>
            <div className="text-sm font-medium">
                {displayValue}
            </div>
        </div>
    );
} 