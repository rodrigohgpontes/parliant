"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteSurveyServerAction } from "@/lib/actions/survey-server-actions";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { getColorFromId } from "./activity-chart";
import { Survey } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock } from "lucide-react";

interface SurveyCardProps {
  survey: Survey;
  metrics?: {
    started: number;
    completed: number;
    completionRate: number;
    avgCompletionTime: number;
  };
}

export function SurveyCard({ survey, metrics }: SurveyCardProps) {
  const handleDelete = async () => {
    await deleteSurveyServerAction(survey.id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getColorFromId(survey.id) }}
          />
          {survey.objective}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {survey.orientations || "No description provided"}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={survey.is_active ? "default" : "secondary"}>
            {survey.is_active ? "Active" : "Inactive"}
          </Badge>
          {metrics && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{metrics.started} started</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>{metrics.completed} completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{metrics.avgCompletionTime.toFixed(0)} min avg</span>
              </div>
            </div>
          )}
        </div>
        {metrics && (
          <div className="mt-2">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.completionRate}% completion rate
            </p>
          </div>
        )}
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