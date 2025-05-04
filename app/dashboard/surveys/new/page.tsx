"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSurveyServerAction } from "@/lib/actions/survey-server-actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateSurveyPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Survey</h1>
          <p className="text-muted-foreground mt-1">Set up your survey details</p>
        </div>
      </div>

      <form action={createSurveyServerAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Objective</CardTitle>
            <CardDescription>
              Define what you want to learn from the survey. Be specific about the knowledge or insights you're seeking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="objective">Learning Objective</Label>
              <Input
                id="objective"
                name="objective"
                placeholder="What do you want to learn from this survey?"
                required
                className="border-primary/50 bg-primary/5 focus:border-primary focus:ring-primary hover:border-primary text-xl h-16"
              />
              <p className="text-sm text-muted-foreground">
                Tips for writing a good learning objective:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1 ">
                <li>Be specific about the knowledge or insights you want to gain</li>
                <li>Focus on what you want to learn, not how you'll use the information</li>
                <li>Make it clear and concise, but detailed enough to guide the AI</li>
                <li>Example: "Understand the key challenges faced by remote workers in maintaining work-life balance"</li>
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
              <Label htmlFor="orientations">AI Assistant Guidelines</Label>
              <Textarea
                id="orientations"
                name="orientations"
                placeholder="Provide context and guidance for the AI assistant..."
                className="min-h-[200px] border-primary/50 bg-primary/5 focus:border-primary focus:ring-primary hover:border-primary text-lg"
              />
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

        <div className="flex justify-end">
          <Button type="submit">Create Survey</Button>
        </div>
      </form>
    </div>
  );
}
