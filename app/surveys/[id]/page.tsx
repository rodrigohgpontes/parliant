"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Send, Shuffle, Mic, RefreshCw } from "lucide-react";
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
import { AudioRecorder } from "@/app/components/AudioRecorder";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

interface Survey {
  id: string;
  title: string;
  description: string;
  objective: string;
  orientations?: string;
  allow_anonymous: boolean;
  first_question?: string;
  max_questions?: number;
  max_characters?: number;
  is_active: boolean;
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

// function getParlyMood(insightLevel: number, explanation: string | null) {
//   // Default to neutral state
//   let color: MascotColor = "blue";
//   let energy: MascotEnergy = "neutral";
//   let eyes: MascotEyes = "tense";
//   let mouth: MascotMouth = "happy";
//   let emote: MascotEmote | undefined = undefined;

//   // Determine color based on insight level
//   if (insightLevel >= 8) {
//     color = "green";
//   } else if (insightLevel >= 6) {
//     color = "blue";
//   } else if (insightLevel >= 4) {
//     color = "yellow";
//   } else {
//     color = "red";
//   }

//   // Determine energy level
//   if (insightLevel >= 8) {
//     energy = "very_high";
//   } else if (insightLevel >= 6) {
//     energy = "high";
//   } else if (insightLevel >= 4) {
//     energy = "neutral";
//   } else if (insightLevel >= 2) {
//     energy = "low";
//   } else {
//     energy = "very_low";
//   }

//   // Determine facial expression
//   if (insightLevel >= 8) {
//     eyes = "absent";
//     mouth = "happy";
//     emote = "heart";
//   } else if (insightLevel >= 6) {
//     eyes = "uninstered";
//     mouth = "happy";
//   } else if (insightLevel >= 4) {
//     eyes = "tense";
//     mouth = "happy";
//     emote = "thinking";
//   } else if (insightLevel >= 2) {
//     eyes = "uncomfortable";
//     mouth = "happy";
//     emote = "confused";
//   } else {
//     eyes = "sad";
//     mouth = "happy";
//   }

//   return { color, energy, eyes, mouth, emote };
// }

// function getRandomParlyMood() {
//   const colors: MascotColor[] = ["blue", "green", "red", "yellow"];
//   const energies: MascotEnergy[] = ["very_low", "low", "neutral", "high", "very_high"];
//   const eyes: MascotEyes[] = ["tense", "absent", "uninstered", "sad", "uncomfortable", "angry", "suspicious", "judgemental", "determined", "crazy", "bored"];
//   const mouths: MascotMouth[] = ["happy", "unresponsive", "sad", "quiet", "suffering", "smirky", "tense", "nervous", "overwhelmed", "cute", "shocked", "disappointed", "joyful", "scared", "uncomfortable", "embarassed", "frown", "surprised", "regret", "fun"];
//   const emotes: MascotEmote[] = ["thinking", "heart", "confused"];

//   return {
//     color: colors[Math.floor(Math.random() * colors.length)],
//     energy: energies[Math.floor(Math.random() * energies.length)],
//     eyes: eyes[Math.floor(Math.random() * eyes.length)],
//     mouth: mouths[Math.floor(Math.random() * mouths.length)],
//     emote: Math.random() > 0.3 ? emotes[Math.floor(Math.random() * emotes.length)] : undefined
//   };
// }

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
  title: 'Survey Response - Parliant.AI',
  description: 'Respond to survey'
};

export default function SurveyResponsePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const responseId = searchParams.get('responseId');
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showRespondentModal, setShowRespondentModal] = useState(false);
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(responseId);
  const [insightLevel, setInsightLevel] = useState(0);
  const [insightExplanation, setInsightExplanation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  // Helper function to count user messages
  const getUserMessageCount = () => {
    return messages.filter(msg => msg.role === 'user').length;
  };

  // Helper function to check if max questions is reached
  const isMaxQuestionsReached = () => {
    return survey?.max_questions !== undefined && getUserMessageCount() >= survey.max_questions;
  };

  // Helper function to check if approaching max questions (80% or more)
  const isApproachingMaxQuestions = () => {
    return survey?.max_questions !== undefined &&
      getUserMessageCount() >= Math.floor(survey.max_questions * 0.8) &&
      getUserMessageCount() < survey.max_questions;
  };

  // Helper function to get remaining questions
  const getRemainingQuestions = () => {
    if (!survey?.max_questions) return null;
    return survey.max_questions - getUserMessageCount();
  };

  // Helper function to check if character limit is reached or exceeded
  const isOverCharacterLimit = () => {
    return survey?.max_characters !== undefined && input.length > survey.max_characters;
  };

  // Helper function to get remaining characters
  const getRemainingCharacters = () => {
    if (!survey?.max_characters) return null;
    return survey.max_characters - input.length;
  };

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
          console.log("Survey data received:", data);
          setSurvey(data);

          // If we have a response ID, fetch the existing response
          if (responseId) {
            const responseRes = await fetch(`/api/surveys/${params.id}/public/responses/${responseId}`);
            if (responseRes.ok) {
              const responseData = await responseRes.json();
              setMessages(responseData.conversation);
              setCurrentResponseId(responseData.id);
              if (responseData.completed_at) {
                setIsSubmitted(true);
              }
            }
            setInitialLoading(false);
            return;
          }

          // Check if the survey is active before showing the form
          if (!data.is_active) {
            console.log("Survey is not active, showing closed message");
            setIsSubmitted(true);
            setInitialLoading(false);
            return;
          }

          // Initialize conversation with first question if available, otherwise get AI's first message
          if (data.first_question) {
            setMessages([
              {
                role: "assistant",
                content: data.first_question,
              },
            ]);
            setInitialLoading(false);
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
            setInitialLoading(false);
          }
        } else if (res.status === 404) {
          // Survey not found
          console.log("Survey not found, showing closed message");
          setIsSubmitted(true);
          setInitialLoading(false);
        }
      } catch (error) {
        console.error("Error fetching survey:", error);
        setInitialLoading(false);
      }
    };

    fetchSurvey();
  }, [params.id, responseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for conditions that prevent submission
    if (!input.trim() || isSubmitted || !survey?.is_active) return;

    // Check if we've reached the maximum number of questions
    if (isMaxQuestionsReached()) {
      // Instead of returning, show a notification and auto-submit
      if (currentResponseId) {
        await handleFinalSubmit();
      }
      return;
    }

    // Check if we've exceeded the character limit
    if (isOverCharacterLimit()) {
      return;
    }

    // Check if the response is already completed in a separate API call to ensure we have the latest status
    if (currentResponseId) {
      try {
        const checkRes = await fetch(`/api/surveys/${params.id}/public/responses/${currentResponseId}`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.completed_at) {
            setIsSubmitted(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking response status:", error);
      }
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // If this is the first message, create a response record first
      if (!currentResponseId) {
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
          setCurrentResponseId(data.id);

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
            }).then(async (updateRes) => {
              // Check if the response was rejected because it's already completed
              if (updateRes.status === 403) {
                const errorData = await updateRes.json();
                if (errorData.completed) {
                  setIsSubmitted(true);
                  return;
                }
                if (errorData.max_reached) {
                  // Auto-submit when max questions is reached
                  await handleFinalSubmit();
                  return;
                }
                if (errorData.character_limit_exceeded) {
                  // Handle character limit exceeded error
                  alert(`Message exceeds character limit of ${errorData.max_characters} characters.`);
                  // Remove the last message that caused the error
                  setMessages(messages);
                  return;
                }
              }
            }).catch(error => {
              console.error("Error updating response:", error);
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

            // Check if we've reached max_questions after the first question
            const userMessageCount = updatedMessages.filter(msg => msg.role === "user").length;
            console.log(`User message count: ${userMessageCount}, Max questions: ${survey?.max_questions}`);
            if (survey?.max_questions && userMessageCount >= survey.max_questions) {
              console.log("Max questions reached, auto-submitting survey");
              await handleFinalSubmit();
            }
          }
        } else if (res.status === 403) {
          // Handle error responses
          const errorData = await res.json();
          if (errorData.character_limit_exceeded) {
            alert(`Message exceeds character limit of ${errorData.max_characters} characters.`);
            // Revert to previous messages state
            setMessages(messages);
            return;
          }
        }
      } else {
        // Add user message to chat
        const newMessages = [...messages, { role: "user" as const, content: userMessage }];
        setMessages(newMessages);

        // Count user messages to check if we're at the max_questions limit
        const userMessageCount = newMessages.filter(msg => msg.role === "user").length;
        console.log(`User message count: ${userMessageCount}, Max questions: ${survey?.max_questions}`);

        // If we've reached max_questions, auto-submit the survey after adding the user's message
        if (survey?.max_questions && userMessageCount >= survey.max_questions) {
          console.log("Max questions reached, auto-submitting survey");
          // Update the response in the database with the final user message
          await fetch(`/api/surveys/${params.id}/responses/${currentResponseId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversation: newMessages,
            }),
          });

          // Submit the survey
          await handleFinalSubmit();
          setIsLoading(false);
          return;
        }

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
          await fetch(`/api/surveys/${params.id}/responses/${currentResponseId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversation: updatedMessages,
            }),
          }).then(async (updateRes) => {
            // Check if the response was rejected because it's already completed
            if (updateRes.status === 403) {
              const errorData = await updateRes.json();
              if (errorData.completed) {
                setIsSubmitted(true);
                return;
              }
              if (errorData.max_reached) {
                // Auto-submit when max questions is reached
                await handleFinalSubmit();
                return;
              }
              if (errorData.character_limit_exceeded) {
                // Handle character limit exceeded error
                alert(`Message exceeds character limit of ${errorData.max_characters} characters.`);
                // Remove the last message that caused the error
                setMessages(messages);
                return;
              }
            }
          }).catch(error => {
            console.error("Error updating response:", error);
          });

          // Evaluate the conversation insight after both messages are added
          setIsEvaluating(true);
          const evaluationRes = await fetch(`/api/surveys/${params.id}/responses/${currentResponseId}/evaluate`, {
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

          // Check if we need to auto-submit after this exchange
          // We count user messages again to check if we've reached the limit
          if (survey?.max_questions && userMessageCount >= survey.max_questions) {
            console.log("Max questions reached after AI response, auto-submitting survey");
            await handleFinalSubmit();
          }
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
    }
    setIsLoading(false);
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
      const res = await fetch(`/api/surveys/${params.id}/responses/${currentResponseId}`, {
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
    } catch (error) {
      console.error("Error updating respondent info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${params.id}/responses/${currentResponseId}`, {
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

  const handleTranscriptionComplete = (text: string) => {
    // If there's a character limit and the transcribed text exceeds it, truncate the text
    if (survey?.max_characters && text.length > survey.max_characters) {
      // Truncate to the max character limit
      text = text.substring(0, survey.max_characters);

      // Show a notification to the user
      alert(`Your transcribed message has been truncated to the maximum ${survey.max_characters} characters allowed.`);
    }

    setInput(text);
    setShowAudioRecorder(false);
  };

  if (isSubmitted) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            {currentResponseId ? "Thank You!" : "Survey Closed"}
          </h1>
          <p className="text-muted-foreground">
            {currentResponseId
              ? "Your response has been submitted successfully."
              : "This survey is no longer accepting responses."}
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {initialLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : isSubmitted ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">
                  {currentResponseId ? "Thank you for your response!" : "This survey is closed"}
                </h2>
                <p className="text-gray-600 mb-8">
                  {currentResponseId
                    ? "Your feedback has been submitted successfully."
                    : "This survey is no longer accepting new responses."}
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="text-[14px] sm:text-[15px] font-medium rounded-full"
                >
                  Return Home
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          P
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-white">
                          <div className="w-full h-full rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!survey.is_active && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p className="text-amber-700 text-sm">
                        This survey has been closed by the creator. You can view the conversation, but no new responses can be submitted.
                      </p>
                    </div>
                  )}

                  {survey.max_questions && survey.is_active && (
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Questions:</span>
                        <div className="bg-muted rounded-full px-3 py-0.5 text-xs">
                          <span className={
                            isMaxQuestionsReached()
                              ? "text-red-600 font-semibold"
                              : isApproachingMaxQuestions()
                                ? "text-amber-600 font-medium"
                                : "text-blue-600"
                          }>
                            {getUserMessageCount()}
                          </span>
                          <span> / {survey.max_questions}</span>
                        </div>
                      </div>
                      {(isMaxQuestionsReached() || isApproachingMaxQuestions()) && (
                        <div className={
                          isMaxQuestionsReached()
                            ? "text-red-600 text-xs font-medium"
                            : "text-amber-700 text-xs"
                        }
                        >
                          {isMaxQuestionsReached()
                            ? "Maximum questions reached. Please submit your response."
                            : `Approaching question limit (${getRemainingQuestions()} remaining)`
                          }
                        </div>
                      )}
                    </div>
                  )}

                  {/* Character limit indicator */}
                  {survey.max_characters && survey.is_active && (
                    <div className="flex justify-end items-center mb-2">
                      <div className={`text-xs ${isOverCharacterLimit()
                        ? "text-red-600 font-semibold"
                        : input.length > survey.max_characters * 0.8
                          ? "text-amber-600"
                          : "text-gray-500"
                        }`}>
                        {input.length} / {survey.max_characters} characters
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                            }`}
                        >
                          <p className="text-sm font-medium mb-1 opacity-70">
                            {message.role === 'user' ? 'You' : 'Assistant'}
                          </p>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {(() => {
                      return (
                        <div className="relative">
                          <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                              !survey.is_active
                                ? "This survey is no longer accepting responses"
                                : (isMaxQuestionsReached())
                                  ? "Maximum questions reached. Please submit your response."
                                  : survey.max_characters
                                    ? `Type your message... (Max ${survey.max_characters} characters)`
                                    : "Type your message..."
                            }
                            maxLength={survey.max_characters}
                            className={`min-h-[100px] resize-none pr-24 ${isOverCharacterLimit() ? 'border-red-500 focus:ring-red-500' : ''}`}
                            disabled={isLoading || isSubmitted || !survey.is_active || isMaxQuestionsReached()}
                          />
                          <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowAudioRecorder(true)}
                              disabled={isLoading || isSubmitted || !survey.is_active || isMaxQuestionsReached()}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Mic className="h-4 w-4" />
                            </Button>
                            <Button
                              type="submit"
                              disabled={!input.trim() || isLoading || isSubmitted || !survey.is_active || isMaxQuestionsReached() || isOverCharacterLimit()}
                              className="text-[14px] sm:text-[15px] font-medium rounded-full"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                "Send"
                              )}
                            </Button>
                          </div>
                          {isOverCharacterLimit() && (
                            <div className="text-red-600 text-xs mt-1">
                              Your message exceeds the maximum character limit.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </form>

                  <div className="flex items-center justify-center w-full">
                    <div className="w-[85%] sm:w-3/4">
                      <Thermometer value={insightLevel} max={10} explanation={insightExplanation || undefined} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || messages.length < 2 || !currentResponseId || !survey.is_active}
                    className="text-[14px] sm:text-[15px] font-medium rounded-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Survey"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={showRespondentModal}
        onOpenChange={(open) => {
          // Only allow closing if anonymous answers are allowed or if we're opening the modal
          if (survey?.allow_anonymous || open) {
            setShowRespondentModal(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tell us about yourself</DialogTitle>
            <DialogDescription>
              {survey?.allow_anonymous
                ? "This information is optional. You can skip this step."
                : "Please provide your information to continue."}
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
                required={!survey?.allow_anonymous}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                placeholder="Your email"
                required={!survey?.allow_anonymous}
              />
            </div>
            <div className="flex justify-end gap-2">
              {survey?.allow_anonymous && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRespondentModal(false)}
                >
                  Skip
                </Button>
              )}
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAudioRecorder} onOpenChange={setShowAudioRecorder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Audio</DialogTitle>
            <DialogDescription>
              Record your message and we'll transcribe it for you.
            </DialogDescription>
          </DialogHeader>
          <AudioRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
            onCancel={() => setShowAudioRecorder(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
