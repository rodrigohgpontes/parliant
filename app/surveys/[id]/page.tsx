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
import { MascotColor, MascotEnergy, MascotEyes, MascotMouth, MascotEmote } from '@/app/lib/mascot-constants';

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
  role: "user" | "assistant" | "system";
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
  let color: MascotColor = "blue";
  let energy: MascotEnergy = "neutral";
  let eyes: MascotEyes = "tense";
  let mouth: MascotMouth = "happy";
  let emote: MascotEmote | undefined = undefined;

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
    mouth = "happy";
    emote = "heart";
  } else if (insightLevel >= 6) {
    eyes = "uninstered";
    mouth = "happy";
  } else if (insightLevel >= 4) {
    eyes = "tense";
    mouth = "happy";
    emote = "thinking";
  } else if (insightLevel >= 2) {
    eyes = "uncomfortable";
    mouth = "happy";
    emote = "confused";
  } else {
    eyes = "sad";
    mouth = "happy";
  }

  return { color, energy, eyes, mouth, emote };
}

function getRandomParlyMood() {
  const colors: MascotColor[] = ["blue", "green", "red", "yellow"];
  const energies: MascotEnergy[] = ["very_low", "low", "neutral", "high", "very_high"];
  const eyes: MascotEyes[] = ["tense", "absent", "uninstered", "sad", "uncomfortable", "angry", "suspicious", "judgemental", "determined", "crazy", "bored"];
  const mouths: MascotMouth[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u"];
  const emotes: MascotEmote[] = ["thinking", "heart", "confused"];

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
        const newMessages = [
          ...messages,
          { role: "user" as const, content: userMessage }
        ];

        if (insightExplanation) {
          newMessages.push({
            role: "system" as const,
            content: `
            This is the current feedback on the insightfulness of the user's answers in the conversation:
            ${insightExplanation}.
            Please continue the conversation with the user and aim to extract from them more insightful answers if possibles.
            `
          });
        }
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
    <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="container max-w-2xl py-6 sm:py-12 px-4 sm:px-6 font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif]">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground/90">{survey.title}</h1>
            {survey.objective && (
              <p className="mt-2 sm:mt-3 text-base sm:text-lg leading-relaxed">{survey.objective}</p>
            )}
            <p className="mt-2 text-sm text-primary">This survey uses an AI chat format to make the process more natural and engaging. Feel free to express yourself in your own voice and style - there's no need for formal language.</p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col h-[700px] sm:h-[700px] border rounded-2xl overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {messages.filter(message => message.role !== "system").map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 ${message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                        }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px]">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl p-2 sm:p-3">
                      <LoadingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-3 sm:p-4 space-y-3 sm:space-y-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your response... (Ctrl+Enter or ⌘+Enter to send)"
                    className="flex-1 text-[14px] sm:text-[15px] rounded-2xl resize-none"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading} className="rounded-full">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <div className="flex items-center justify-center w-full">
                  <div className="w-[85%] sm:w-3/4">
                    <Thermometer value={insightLevel} max={10} explanation={insightExplanation || undefined} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || messages.length < 2 || !responseId}
              className="text-[14px] sm:text-[15px] font-medium rounded-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </div>
        </div>

        <Dialog open={showRespondentModal} onOpenChange={setShowRespondentModal}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight">Tell us about yourself</DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                {survey.allow_anonymous
                  ? "This information is optional. You can skip this step if you prefer to remain anonymous."
                  : "Please provide your information to continue with the survey."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRespondentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[15px] font-medium">Name</Label>
                <Input
                  id="name"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Your name"
                  required={!survey.allow_anonymous}
                  className="text-[15px] rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[15px] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="your@email.com"
                  required={!survey.allow_anonymous}
                  className="text-[15px] rounded-xl"
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
                        setInput("");
                        handleRespondentSubmit(new Event("submit") as any);
                      }}
                      className="text-[15px] font-medium rounded-full"
                    >
                      Skip
                    </Button>

                  </>
                )}
                <Button type="submit" className="text-[15px] font-medium rounded-full">Continue</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
