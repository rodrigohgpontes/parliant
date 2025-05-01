"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Survey {
  id?: number;
  title: string;
  description?: string;
  createdAt?: Date;
  is_active?: boolean;
}

interface SurveyFormProps {
  survey?: Survey;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

export function SurveyForm({ survey, onSubmit, onCancel }: SurveyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <form action={handleSubmit}>
        <CardHeader>
          <CardTitle>{survey ? "Edit Survey" : "Create New Survey"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={survey?.title || ""}
              placeholder="Enter survey title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={survey?.description || ""}
              placeholder="Enter survey description"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : survey ? "Update Survey" : "Create Survey"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
