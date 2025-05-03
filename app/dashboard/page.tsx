import { Button } from "@/components/ui/button";
import { SurveyCard } from "@/components/survey-card";
import { getSurveysServerAction } from "@/lib/actions/survey-server-actions";
import { getResponsesServer } from "@/lib/actions/server-data-actions";
import Link from "next/link";
import { Plus, BarChart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityChart } from "@/components/activity-chart";

export default async function DashboardPage() {
  const surveys = await getSurveysServerAction();
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.is_active).length;

  // Get responses for all surveys
  const allResponses = await Promise.all(
    surveys.map(survey => getResponsesServer(survey.id))
  );
  const totalResponses = allResponses.reduce((acc, responses) => acc + responses.length, 0);

  // Flatten all responses for the chart
  const responses = allResponses.flat();

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Surveys</h1>
          <p className="text-muted-foreground mt-2">Manage and analyze your survey data</p>
        </div>
        <Link href="/dashboard/surveys/new">
          <Button className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSurveys}</div>
            <p className="text-xs text-muted-foreground">
              {activeSurveys} active surveys
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              Across all surveys
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ActivityChart responses={responses} surveys={surveys} />
          </CardContent>
        </Card>
      </div>

      {surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">No surveys yet</h2>
              <p className="text-muted-foreground mt-2">Create your first survey to start collecting insights</p>
            </div>
            <Link href="/dashboard/surveys/new">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Survey
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      )}
    </div>
  );
}
