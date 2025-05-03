"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteSurveyServerAction } from "@/lib/actions/survey-server-actions";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { getColorFromId } from "./activity-chart";

interface SurveyCardProps {
  survey: {
    id: string;
    title: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    user_id: string;
    is_active: boolean;
  };
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const handleDelete = async () => {
    await deleteSurveyServerAction(survey.id);
  };

  const color = getColorFromId(survey.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <CardTitle>{survey.title}</CardTitle>
        </div>
        {survey.description && <CardDescription>{survey.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Created: {new Date(survey.created_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/dashboard/surveys/${survey.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
