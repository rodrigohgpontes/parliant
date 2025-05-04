"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Survey } from "@/lib/types";
import { AIServiceFactory } from "@/lib/ai/service";
import { AI_PROVIDERS } from "@/lib/ai/types";
import { Trash2 } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function PublicSurveyPage() {
    const params = useParams();
    const router = useRouter();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSurvey = async () => {
            console.log("Fetching survey with ID:", params.id);
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/surveys/${params.id}/public`);
                console.log("API response status:", res.status);

                if (res.status === 403) {
                    const errorData = await res.json();
                    setError("This survey is no longer accepting responses. The survey creator has closed it for new submissions.");
                    return;
                }

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("API error:", errorData);
                    throw new Error(errorData.error || "Failed to fetch survey");
                }

                const data = await res.json();
                console.log("Received survey data:", data);

                if (!data) {
                    throw new Error("No survey data received");
                }

                setSurvey(data);
                // Initialize conversation with AI's first message
                setMessages([
                    {
                        role: "assistant",
                        content: `Hi! I'm conducting a survey about ${data.objective}. Let's start with a specific question: What is your most recent experience with this topic? Please describe it in detail.`,
                    },
                ]);
            } catch (error) {
                console.error("Error fetching survey:", error);
                setError(error instanceof Error ? error.message : "Failed to load survey");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSurvey();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !survey) return;

        // Check character limit
        if (survey.max_characters && input.length > survey.max_characters) {
            setError(`Message exceeds the maximum character limit of ${survey.max_characters}`);
            return;
        }

        // Check question limit
        if (survey.max_questions && messages.filter(m => m.role === "user").length >= survey.max_questions) {
            setError("Maximum number of questions reached");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Add user message
            const userMessage: Message = { role: "user", content: input };
            setMessages(prev => [...prev, userMessage]);
            setInput("");

            // Get AI response through our API
            const response = await fetch(`/api/surveys/${params.id}/public/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    survey: {
                        objective: survey.objective,
                        max_questions: survey.max_questions,
                        max_characters: survey.max_characters,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get AI response");
            }

            const data = await response.json();

            // Add AI response
            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);

            // Check if AI considers the survey complete
            if (data.content.toLowerCase().includes("survey complete") ||
                data.content.toLowerCase().includes("thank you for your time")) {
                setIsCompleted(true);
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
            setError(error instanceof Error ? error.message : "Failed to get AI response");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMessage = (index: number) => {
        setMessages(prev => prev.slice(0, index));
    };

    const handleComplete = async () => {
        if (!survey) return;

        try {
            await fetch(`/api/surveys/${params.id}/public/responses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversation: messages,
                    completed_at: new Date().toISOString(),
                }),
            });

            setIsCompleted(true);
        } catch (error) {
            console.error("Error submitting response:", error);
            setError("Failed to submit response");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (error) {
        return (
            <div className="container max-w-2xl py-12">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Survey Unavailable</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="container max-w-2xl py-12">
                <div className="text-center">
                    <p>Loading survey...</p>
                </div>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="container max-w-2xl py-12">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Thank You!</h1>
                    <p className="text-muted-foreground">
                        Your response has been submitted successfully.
                    </p>
                    <div className="pt-4">
                        <Button onClick={() => router.push("/")}>
                            Create Your Own AI Survey
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-12">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Survey</h1>
                    <p className="mt-2 text-muted-foreground">{survey.objective}</p>
                </div>

                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {message.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium">AI</span>
                                </div>
                            )}
                            <div className="flex flex-col max-w-[80%]">
                                <div
                                    className={`p-3 rounded-lg ${message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                        }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                </div>
                                {message.role === "user" && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 self-end mt-1"
                                                    onClick={() => handleDeleteMessage(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Delete this message and restart conversation from here</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            {message.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary-foreground">U</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message here... (Press ⌘+Enter or Ctrl+Enter to send)"
                            className="min-h-[100px]"
                            disabled={isLoading}
                        />
                        {survey.max_characters && (
                            <p className="text-sm text-muted-foreground">
                                {input.length}/{survey.max_characters} characters
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send Message"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleComplete}
                            disabled={isLoading}
                        >
                            Complete Survey
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 