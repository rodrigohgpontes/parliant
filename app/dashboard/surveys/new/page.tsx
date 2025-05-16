"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSurveyServerAction } from "@/lib/actions/survey-server-actions";
import { ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

export default function CreateSurveyPage() {
  const [objective, setObjective] = useState("");
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [guidelines, setGuidelines] = useState("");
  const [isImprovingGuidelines, setIsImprovingGuidelines] = useState(false);
  const [firstQuestion, setFirstQuestion] = useState("");
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRephrase = async () => {
    if (!objective.trim()) {
      toast.error("Please enter a learning objective first");
      return;
    }

    setIsRephrasing(true);
    try {
      const response = await fetch("/api/rephrase-objective", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ objective }),
      });

      if (!response.ok) {
        throw new Error("Failed to rephrase objective");
      }

      const data = await response.json();
      setObjective(data.rephrasedObjective);
      toast.success("Learning objective rephrased successfully!");
    } catch (error) {
      toast.error("Failed to rephrase learning objective");
      console.error(error);
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleImproveGuidelines = async () => {
    if (!objective.trim()) {
      toast.error("Please enter a learning objective first");
      return;
    }

    setIsImprovingGuidelines(true);
    try {
      const response = await fetch("/api/improve-guidelines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objective,
          guidelines: guidelines.trim(),
          isNew: !guidelines.trim()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to improve guidelines");
      }

      const data = await response.json();
      setGuidelines(data.improvedGuidelines);
      toast.success(guidelines.trim() ? "Guidelines improved successfully!" : "Guidelines generated successfully!");
    } catch (error) {
      toast.error("Failed to improve guidelines");
      console.error(error);
    } finally {
      setIsImprovingGuidelines(false);
    }
  };

  const handleGenerateFirstQuestion = async () => {
    if (!objective.trim()) {
      toast.error("Please enter a learning objective first");
      return;
    }

    setIsGeneratingQuestion(true);
    try {
      const response = await fetch("/api/generate-first-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objective,
          guidelines: guidelines.trim(),
          currentQuestion: firstQuestion.trim()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate first question");
      }

      const data = await response.json();
      setFirstQuestion(data.firstQuestion);
      toast.success("First question generated successfully!");
    } catch (error) {
      toast.error("Failed to generate first question");
      console.error(error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createSurveyServerAction(formData);

      if (result?.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      } else {
        toast.success("Survey created successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to create survey");
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">New Survey</h1>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Objective</CardTitle>
            <CardDescription>
              Define what you want to learn from the survey. Be specific about the knowledge or insights you're seeking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Learning Objective</Label>
              <p className="text-sm text-muted-foreground text-red-500">Visible to the respondent</p>
              <div className="flex gap-2">
                <Textarea
                  id="title"
                  name="title"
                  placeholder="What do you want to learn from this survey?"
                  required
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="border-primary/50 bg-primary/5 focus:border-primary focus:ring-primary hover:border-primary text-xl min-h-[64px] resize-y"
                />
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={objective.trim() ? "secondary" : "outline"}
                        size="icon"
                        onClick={handleRephrase}
                        disabled={isRephrasing || !objective.trim()}
                        className="h-16 w-16"
                      >
                        <Wand2 className={`h-5 w-5 ${isRephrasing ? "animate-spin" : ""}`} />
                        <span className="sr-only">Let AI rephrase it</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Let AI improve your learning objective to make it more specific and engaging</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Tips for writing a good learning objective:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1 ">
                <li>Be specific about the knowledge or insights you want to gain</li>
                <li>Focus on what you want to learn, not how you'll use the information</li>
                <li>Make it clear and concise, but detailed enough to guide the AI</li>
                <li>Format your objective as a clear, specific question in second person voice</li>
                <li>Example: "What challenges do you face in maintaining work-life balance while working remotely?"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Guidelines</CardTitle>
            <CardDescription>
              Provide context and guidance for the AI assistant to conduct meaningful conversations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">AI Assistant Guidelines</Label>
              <div className="flex gap-2">
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide context and guidance for the AI assistant..."
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="min-h-[200px] border-primary/50 bg-primary/5 focus:border-primary focus:ring-primary hover:border-primary text-lg"
                />
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={objective.trim() ? "secondary" : "outline"}
                        size="icon"
                        onClick={handleImproveGuidelines}
                        disabled={isImprovingGuidelines || !objective.trim()}
                        className="h-[200px] w-16"
                      >
                        <Wand2 className={`h-5 w-5 ${isImprovingGuidelines ? "animate-spin" : ""}`} />
                        <span className="sr-only">Let AI improve guidelines</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{guidelines.trim() ? "Let AI improve your guidelines" : "Let AI suggest guidelines"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Tips for writing effective guidelines:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1">
                <li>Describe the target audience and their context</li>
                <li>Specify the type of information you want to collect</li>
                <li>Include any specific topics or areas to explore</li>
                <li>Set expectations for the conversation style and depth</li>
                <li>Example: "Focus on understanding daily routines, challenges, and coping strategies. Ask follow-up questions to get specific examples and details."</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>First Question (Optional)</CardTitle>
            <CardDescription>
              If provided, this question will be shown to the respondent as the first question of the survey without any AI consideration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first-question">First Question</Label>
              <div className="flex gap-2">
                <Textarea
                  id="first-question"
                  name="first_question"
                  placeholder="Enter the first question to ask the respondent..."
                  value={firstQuestion}
                  onChange={(e) => setFirstQuestion(e.target.value)}
                  className="min-h-[100px] border-primary/50 bg-primary/5 focus:border-primary focus:ring-primary hover:border-primary"
                />
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={objective.trim() ? "secondary" : "outline"}
                        size="icon"
                        onClick={handleGenerateFirstQuestion}
                        disabled={isGeneratingQuestion || !objective.trim()}
                        className="h-[100px] w-16"
                      >
                        <Wand2 className={`h-5 w-5 ${isGeneratingQuestion ? "animate-spin" : ""}`} />
                        <span className="sr-only">Let AI suggest first question</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Let AI suggest an engaging first question based on your objective and guidelines</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                This field is optional. If left empty, the AI will determine the most appropriate first question based on your learning objective and guidelines.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Survey Settings</CardTitle>
            <CardDescription>
              Configure additional settings for your survey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-anonymous">Allow Anonymous Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Let respondents complete the survey without providing their identity
                </p>
              </div>
              <Switch
                id="allow-anonymous"
                checked={allowAnonymous}
                onCheckedChange={setAllowAnonymous}
                name="allow_anonymous"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Survey"}
          </Button>
        </div>
      </form>
    </div>
  );
}
