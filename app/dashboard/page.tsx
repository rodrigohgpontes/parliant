import { Button } from "@/components/ui/button";
import { SurveyCard } from "@/components/survey-card";
import { getSurveysServerAction } from "@/lib/actions/survey-server-actions";
import { getResponsesServer } from "@/lib/actions/server-data-actions";
import Link from "next/link";
import { Plus, BarChart, Users, Sparkles, MessageSquare, Brain, Zap } from "lucide-react";
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
        {surveys.length >= 3 && (
          <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-md border border-amber-200">
            You've reached the limit of 3 surveys on the free plan. <Link href="/subscription" className="font-medium underline">Upgrade to Pro</Link> to create unlimited surveys.
          </div>
        )}
        {surveys.length < 3 ? (
          <Link href="/dashboard/surveys/new">
            <Button className="h-10">
              <Plus className="mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </Link>
        ) : (
          <Button className="h-10" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        )}
      </div>

      {surveys.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="w-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">Survey Overview</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-bold text-primary">{activeSurveys}</div>
                  <p className="text-xs text-muted-foreground">
                    Active surveys
                  </p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold">{totalSurveys}</div>
                  <p className="text-xs text-muted-foreground">
                    Total surveys
                  </p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold">{totalResponses}</div>
                  <p className="text-xs text-muted-foreground">
                    Total responses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-2">
              <ActivityChart responses={responses} surveys={surveys} />
            </CardContent>
          </Card>
        </div>
      )}

      {surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-primary/5">
          <div className="text-center space-y-8 max-w-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Create Your First AI-Powered Survey</h2>
              <p className="text-muted-foreground text-lg">Start collecting valuable insights with our conversational AI surveys</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Natural Conversations</h3>
                  <p className="text-sm text-muted-foreground">Engage respondents with dynamic, human-like conversations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Smart Analysis</h3>
                  <p className="text-sm text-muted-foreground">Get AI-powered insights and summaries of responses</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Quick Setup</h3>
                  <p className="text-sm text-muted-foreground">Create and launch your survey in minutes</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/dashboard/surveys/new">
                <Button size="lg" className="h-12 px-8">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Survey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => {
            const surveyResponses = allResponses.find(r => r[0]?.survey_id === survey.id) || [];
            const completedResponses = surveyResponses.filter(r => r.completed_at);
            const startedResponses = surveyResponses.length;
            const completionRate = startedResponses > 0
              ? Math.round((completedResponses.length / startedResponses) * 100)
              : 0;

            // Calculate average completion time
            const completionTimes = completedResponses
              .map(r => {
                if (r.completed_at && r.created_at) {
                  return new Date(r.completed_at).getTime() - new Date(r.created_at).getTime();
                }
                return 0;
              })
              .filter(time => time > 0);

            const avgCompletionTime = completionTimes.length > 0
              ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / 1000 / 60) // Convert to minutes
              : 0;

            return (
              <SurveyCard
                key={survey.id}
                survey={survey}
                metrics={{
                  started: startedResponses,
                  completed: completedResponses.length,
                  completionRate,
                  avgCompletionTime
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
