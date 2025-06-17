import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ThermometerProps {
    value: number | null;
    max: number;
    explanation?: string;
    className?: string;
    loading?: boolean;
    userStartedTyping?: boolean;
}

export function Thermometer({ value, max, explanation, className, loading, userStartedTyping }: ThermometerProps) {
    const percentage = value !== null ? (value / max) * 100 : 0;
    const displayValue = value !== null ? Math.round(value) : "—";
    const colorIntensity = value !== null ? Math.min(1, value / max) : 0;
    const [showDescription, setShowDescription] = useState(false);

    // Show description when user starts typing or when insight level becomes greater than 0
    useEffect(() => {
        if (userStartedTyping || (value !== null && value > 0)) {
            setShowDescription(true);
        } else if (value === 0 || value === null) {
            setShowDescription(false);
        }
    }, [value, userStartedTyping]);

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Insight Level</span>
            </div>
            <div className="relative h-4 w-full bg-muted rounded-full">
                <div
                    className="absolute left-0 h-full transition-all duration-500 rounded-full"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: `rgba(255, 127, 80, ${0.3 + colorIntensity * 0.7})`
                    }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full text-white text-lg font-bold transition-all duration-500 z-10"
                    style={{
                        left: `calc(${percentage}% - 16px)`,
                        backgroundColor: `rgba(255, 127, 80, ${0.5 + colorIntensity * 0.5})`
                    }}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        displayValue
                    )}
                </div>
            </div>
            <div
                className={cn(
                    "text-sm w-full text-left mt-4 overflow-hidden transition-all duration-500 ease-out",
                    loading && "blur-sm",
                    showDescription
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                )}
            >
                {explanation ? (
                    <>
                        <p className="font-medium mb-2 text-orange-600">Current Evaluation:</p>
                        <p className="text-orange-600">{explanation}</p>
                    </>
                ) : (
                    <>
                        <p className="text-muted-foreground">
                            The Insight Level measures how valuable and informative the conversation is for the survey objective.
                            It considers:
                        </p>
                        <ul className="mt-2 list-disc list-inside text-muted-foreground">
                            <li>Depth of responses</li>
                            <li>Relevance to the survey objective</li>
                            <li>Quality of insights provided</li>
                            <li>Engagement level</li>
                            <li>Clarity of communication</li>
                        </ul>
                        <p className="mt-2 text-muted-foreground">
                            The level updates after each response, ranging from 0 (minimal insight) to 10 (exceptional insight).
                        </p>
                    </>
                )}
            </div>
        </div>
    );
} 