"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
    text: string;
    speed?: number; // milliseconds per character
    className?: string;
    onComplete?: () => void;
}

export function TypingAnimation({
    text,
    speed = 30,
    className,
    onComplete
}: TypingAnimationProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(text.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, speed);

            return () => clearTimeout(timer);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

    // Reset animation when text changes
    useEffect(() => {
        setDisplayedText("");
        setCurrentIndex(0);
    }, [text]);

    return (
        <span className={cn("whitespace-pre-wrap", className)}>
            {displayedText}
            {currentIndex < text.length && (
                <span className="animate-pulse">|</span>
            )}
        </span>
    );
} 