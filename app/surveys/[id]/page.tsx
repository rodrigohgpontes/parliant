"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Send, Shuffle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Thermometer } from "@/components/thermometer";
import { Parly } from "@/components/parly";
import Mascot from '@/app/components/Mascot';

interface Survey {
  id: string;
  title: string;
  description: string;
  objective: string;
  orientations?: string;
  allow_anonymous: boolean;
  first_question?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LoadingDots = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
};

function getParlyMood(insightLevel: number, explanation: string | null) {
  // Default to neutral state
  let color: "blue" | "green" | "red" | "yellow" = "blue";
  let energy: "very_low" | "low" | "neutral" | "high" | "very_high" = "neutral";
  let eyes: "tense" | "absent" | "uninstered" | "sad" | "uncomfortable" = "tense";
  let mouth: "closed_satisfied" | "open_jubilous" | "closed_disappointed" = "closed_satisfied";
  let emote: "thinking" | "heart" | "confused" | undefined = undefined;

  // Determine color based on insight level
  if (insightLevel >= 8) {
    color = "green";
  } else if (insightLevel >= 6) {
    color = "blue";
  } else if (insightLevel >= 4) {
    color = "yellow";
  } else {
    color = "red";
  }

  // Determine energy level
  if (insightLevel >= 8) {
    energy = "very_high";
  } else if (insightLevel >= 6) {
    energy = "high";
  } else if (insightLevel >= 4) {
    energy = "neutral";
  } else if (insightLevel >= 2) {
    energy = "low";
  } else {
    energy = "very_low";
  }

  // Determine facial expression
  if (insightLevel >= 8) {
    eyes = "absent";
    mouth = "open_jubilous";
    emote = "heart";
  } else if (insightLevel >= 6) {
    eyes = "uninstered";
    mouth = "open_jubilous";
  } else if (insightLevel >= 4) {
    eyes = "tense";
    mouth = "closed_satisfied";
    emote = "thinking";
  } else if (insightLevel >= 2) {
    eyes = "uncomfortable";
    mouth = "closed_disappointed";
    emote = "confused";
  } else {
    eyes = "sad";
    mouth = "closed_disappointed";
  }

  return { color, energy, eyes, mouth, emote };
}

function getRandomParlyMood() {
  const colors: ("blue" | "green" | "red" | "yellow")[] = ["blue", "green", "red", "yellow"];
  const energies: ("very_low" | "low" | "neutral" | "high" | "very_high")[] = ["very_low", "low", "neutral", "high", "very_high"];
  const eyes: ("tense" | "angry" | "suspicious" | "sideways" | "confused" | "judgemental" | "determined" | "absent" | "crazy" | "meditative" | "uninstered" | "pain" | "sad" | "bored" | "uncomfortable")[] = [
    "tense", "angry", "suspicious", "sideways", "confused", "judgemental", "determined", "absent", "crazy", "meditative", "uninstered", "pain", "sad", "bored", "uncomfortable"
  ];
  const mouths: ("open_delighted" | "closed_suspicious" | "closed_disappointed" | "closed_muted" | "open_angry" | "open_furious" | "open_astonished" | "closed_awkward" | "closed_shocked" | "closed_confused" | "closed_frustrated" | "open_snarky" | "open_jubilous" | "closed_emotional" | "closed_satisfied" | "closed_droopy" | "closed_fun" | "closed_crazy" | "closed_struggling" | "open_devastated")[] = [
    "open_delighted", "closed_suspicious", "closed_disappointed", "closed_muted", "open_angry", "open_furious", "open_astonished", "closed_awkward", "closed_shocked", "closed_confused", "closed_frustrated", "open_snarky", "open_jubilous", "closed_emotional", "closed_satisfied", "closed_droopy", "closed_fun", "closed_crazy", "closed_struggling", "open_devastated"
  ];
  const emotes: ("heart" | "stressed" | "muted" | "confused" | "tired" | "thinking" | "sleeping" | "singing" | "startled" | "astonished" | "angry" | "furious" | "hot" | "sweating" | "heartbeat" | "skull" | "fire" | "lightning")[] = [
    "heart", "stressed", "muted", "confused", "tired", "thinking", "sleeping", "singing", "startled", "astonished", "angry", "furious", "hot", "sweating", "heartbeat", "skull", "fire", "lightning"
  ];

  return {
    color: colors[Math.floor(Math.random() * colors.length)],
    energy: energies[Math.floor(Math.random() * energies.length)],
    eyes: eyes[Math.floor(Math.random() * eyes.length)],
    mouth: mouths[Math.floor(Math.random() * mouths.length)],
    emote: Math.random() > 0.3 ? emotes[Math.floor(Math.random() * emotes.length)] : undefined
  };
}

export default function SurveyResponsePage() {
  const params = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showRespondentModal, setShowRespondentModal] = useState(false);
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [responseId, setResponseId] = useState<string | null>(null);
  const [insightLevel, setInsightLevel] = useState(0);
  const [insightExplanation, setInsightExplanation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [randomMood, setRandomMood] = useState(getRandomParlyMood());
  const [parlyMood, setParlyMood] = useState(getParlyMood(insightLevel, insightExplanation));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await fetch(`/api/surveys/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSurvey(data);

          // Initialize conversation with first question if available, otherwise get AI's first message
          if (data.first_question) {
            setMessages([
              {
                role: "assistant",
                content: data.first_question,
              },
            ]);
          } else {
            const aiService = await fetch(`/api/surveys/${params.id}/chat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: [],
                survey: {
                  objective: data.objective,
                  orientations: data.orientations,
                },
              }),
            });

            if (aiService.ok) {
              const aiResponse = await aiService.json();
              setMessages([
                {
                  role: "assistant",
                  content: aiResponse.content,
                },
              ]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching survey:", error);
      }
    };

    fetchSurvey();
  }, [params.id]);

  useEffect(() => {
    setParlyMood(getParlyMood(insightLevel, insightExplanation));
  }, [insightLevel, insightExplanation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // If this is the first message, create a response record first
      if (!responseId) {
        // Add user message to the conversation first
        const newMessages = [...messages, { role: "user" as const, content: userMessage }];
        setMessages(newMessages);

        const res = await fetch(`/api/surveys/${params.id}/responses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            respondent_name: null,
            respondent_email: null,
            conversation: newMessages,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setResponseId(data.id);

          // Show the modal for respondent info
          setShowRespondentModal(true);

          // Get AI response
          const aiRes = await fetch(`/api/surveys/${params.id}/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: newMessages,
              survey: {
                objective: survey?.objective,
                orientations: survey?.orientations,
              },
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const updatedMessages = [...newMessages, { role: "assistant" as const, content: aiData.content }];
            setMessages(updatedMessages);

            // Update the response in the database
            await fetch(`/api/surveys/${params.id}/responses/${data.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                conversation: updatedMessages,
              }),
            });

            // Evaluate the conversation insight
            setIsEvaluating(true);
            const evaluationRes = await fetch(`/api/surveys/${params.id}/responses/${data.id}/evaluate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                conversation: updatedMessages,
              }),
            });

            if (evaluationRes.ok) {
              const evaluation = await evaluationRes.json();
              setInsightLevel(evaluation.insight_level);
              setInsightExplanation(evaluation.explanation);
            }
            setIsEvaluating(false);
          }
        }
      } else {
        // Add user message to chat
        const newMessages = [...messages, { role: "user" as const, content: userMessage }];
        setMessages(newMessages);

        // Get AI response
        const res = await fetch(`/api/surveys/${params.id}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: newMessages,
            survey: {
              objective: survey?.objective,
              orientations: survey?.orientations,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const updatedMessages = [...newMessages, { role: "assistant" as const, content: data.content }];
          setMessages(updatedMessages);

          // Update the response in the database
          await fetch(`/api/surveys/${params.id}/responses/${responseId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversation: updatedMessages,
            }),
          });

          // Evaluate the conversation insight after both messages are added
          setIsEvaluating(true);
          const evaluationRes = await fetch(`/api/surveys/${params.id}/responses/${responseId}/evaluate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversation: updatedMessages,
            }),
          });

          if (evaluationRes.ok) {
            const evaluation = await evaluationRes.json();
            setInsightLevel(evaluation.insight_level);
            setInsightExplanation(evaluation.explanation);
          }
          setIsEvaluating(false);
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email if provided
    if (respondentEmail && !respondentEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      // Update the response with respondent info
      const res = await fetch(`/api/surveys/${params.id}/responses/${responseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          respondent_name: respondentName || null,
          respondent_email: respondentEmail || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update respondent info");
      }

      setShowRespondentModal(false);

      // Get AI response for the first message
      const aiRes = await fetch(`/api/surveys/${params.id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          survey: {
            objective: survey?.objective,
            orientations: survey?.orientations,
          },
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const newMessages = [...messages, { role: "assistant" as const, content: data.content }];
        setMessages(newMessages);

        // Update the response in the database
        await fetch(`/api/surveys/${params.id}/responses/${responseId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation: newMessages,
          }),
        });
      }
    } catch (error) {
      console.error("Error updating respondent info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${params.id}/responses/${responseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: messages,
          completed_at: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleRandomize = () => {
    setRandomMood(getRandomParlyMood());
  };

  if (isSubmitted) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Thank You!</h1>
          <p className="text-muted-foreground">
            Your response has been submitted successfully.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
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

  return (
    <div className="container max-w-2xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{survey.title}</h1>
          {survey.objective && (
            <p className="mt-2 text-muted-foreground">{survey.objective}</p>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-4">
            <Thermometer value={insightLevel} max={10} explanation={insightExplanation || undefined} />
            <div className="flex flex-col items-center gap-2">
              <Mascot {...parlyMood} className="w-48 h-48" />
            </div>
          </div>
          <div className="flex-1 flex flex-col h-[600px] border rounded-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <LoadingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response... (Ctrl+Enter or ⌘+Enter to send)"
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleFinalSubmit}
            disabled={isSubmitting || messages.length < 2 || !responseId}
          >
            {isSubmitting ? "Submitting..." : "Submit Survey"}
          </Button>
        </div>
      </div>

      <Dialog open={showRespondentModal} onOpenChange={setShowRespondentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tell us about yourself</DialogTitle>
            <DialogDescription>
              {survey.allow_anonymous
                ? "This information is optional. You can skip this step if you prefer to remain anonymous."
                : "Please provide your information to continue with the survey."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRespondentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Your name"
                required={!survey.allow_anonymous}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                placeholder="your@email.com"
                required={!survey.allow_anonymous}
              />
            </div>
            <DialogFooter className="gap-2">
              {survey.allow_anonymous && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRespondentModal(false);
                      handleRespondentSubmit(new Event("submit") as any);
                    }}
                  >
                    Skip
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowRespondentModal(false);
                      setInput("");
                      handleRespondentSubmit(new Event("submit") as any);
                    }}
                  >
                    Dismiss
                  </Button>
                </>
              )}
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
