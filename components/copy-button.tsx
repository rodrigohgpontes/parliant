"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CopyButtonProps {
    text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip open={copied}>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                        className="h-8 w-8"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Copied!</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
} 