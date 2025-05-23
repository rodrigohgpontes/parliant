import { ConversationCell } from "@/components/conversation-cell";
import { SummaryCell } from "@/components/summary-cell";
import { ExportResponsesButton } from "@/components/export-responses-button";
import { ExportPDFButton } from "@/components/export-pdf-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSurveyServer } from "@/lib/actions/server-data-actions";
import { getResponsesServer, updateResponseSummary, updateSurveySummary, toggleSurveyStatus, updateSurveyGuidelines, markResponseAsCompleted, toggleResponseValidStatus, updateSurveyFirstQuestion } from "@/lib/actions/server-data-actions";
import { ArrowLeft, BarChart, Users, Clock, Activity, Sparkles, Copy, Pencil, X, Check, AlertTriangle, Ban } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { generateSurveySummary } from "@/lib/actions/ai-actions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateSummary } from "@/lib/actions/ai-actions";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { EditableGuidelines } from "@/components/editable-guidelines";
import { EditableFirstQuestion } from "@/components/editable-first-question";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ResponseToggleSwitch } from "@/components/response-toggle-switch";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SurveyDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const survey = await getSurveyServer(id);
  const responses = await getResponsesServer(id);

  if (!survey) {
    notFound();
  }

  const formattedCreatedDate = new Date(survey.created_at).toLocaleDateString();
  const formattedUpdatedDate = new Date(survey.updated_at).toLocaleDateString();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{survey.objective}</h1>
          <p className="text-muted-foreground mt-1">Survey details and responses</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="guidelines" className="border-none">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Assistant Guidelines</AccordionTrigger>
              <AccordionContent>
                <EditableGuidelines
                  guidelines={survey.orientations || null}
                  onSave={async (guidelines) => {
                    "use server";
                    await updateSurveyGuidelines(survey.id, guidelines);
                    revalidatePath(`/dashboard/surveys/${survey.id}`);
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md">First Question</CardTitle>
        </CardHeader>
        <CardContent>
          <EditableFirstQuestion
            question={survey.first_question || null}
            onSave={async (firstQuestion) => {
              "use server";
              await updateSurveyFirstQuestion(survey.id, firstQuestion);
              revalidatePath(`/dashboard/surveys/${survey.id}`);
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-100">
        <CardHeader>
          <CardTitle>Survey Response Link</CardTitle>
          <CardDescription>
            Share this link with respondents to collect responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 w-fit-content">
            <div className="flex-shrink-0">
              <CopyButton text={`${process.env.NEXT_PUBLIC_APP_BASE_URL}/surveys/${survey.id}`} />
            </div>
            <Input
              readOnly
              value={`${process.env.NEXT_PUBLIC_APP_BASE_URL}/surveys/${survey.id}`}
              className="font-mono flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responses.length}</div>
            <p className="text-xs text-muted-foreground">
              {responses.length === 0 ? 'No responses yet' : 'Responses collected'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={survey.is_active ? "default" : "secondary"}>
                  {survey.is_active ? "Active" : "Inactive"}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {survey.is_active ? 'Survey is accepting responses' : 'Survey is not accepting responses'}
                </p>
              </div>
              <form action={async () => {
                "use server";
                await toggleSurveyStatus(survey.id);
                revalidatePath(`/dashboard/surveys/${survey.id}`);
              }}>
                <Button
                  variant={survey.is_active ? "destructive" : "default"}
                  size="sm"
                  className={survey.is_active ? "bg-red-100 hover:bg-red-200 text-red-700" : "bg-green-100 hover:bg-green-200 text-green-700"}
                >
                  {survey.is_active ? "Close Survey" : "Activate"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedUpdatedDate}</div>
            <p className="text-xs text-muted-foreground">
              Created on {formattedCreatedDate}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end mb-8">
        <div className="flex gap-2">
          <ExportResponsesButton surveyId={survey.id} surveyObjective={survey.objective} />
          <ExportPDFButton surveyId={survey.id} surveyObjective={survey.objective} />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Survey Summary</h2>
          {survey.survey_summary && (
            <form action={async () => {
              "use server";
              const currentResponses = await getResponsesServer(survey.id);
              const allResponseSummaries = currentResponses
                .filter(r => r.completed_at && r.summary && !r.is_invalid)
                .map(r => r.summary!);

              const summary = await generateSurveySummary(
                survey.objective,
                survey.orientations,
                allResponseSummaries
              );
              if (summary) {
                await updateSurveySummary(survey.id, summary);
                revalidatePath(`/dashboard/surveys/${survey.id}`);
              }
            }}>
              <Button variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate Summary
              </Button>
            </form>
          )}
        </div>
        {survey.survey_summary ? (
          <div className="bg-muted/50 rounded-lg p-6">
            <p className="whitespace-pre-wrap">
              {survey.survey_summary}
            </p>
          </div>
        ) : (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <form action={async (formData) => {
                  "use server";

                  // Get the responses from the database again to ensure we have the latest data
                  const currentResponses = await getResponsesServer(survey.id);

                  // Find completed responses without summaries
                  const responsesToProcess = currentResponses.filter(r =>
                    r.completed_at && // Only completed responses
                    !r.summary && // Only those without a summary
                    !r.is_invalid // Only valid responses
                  );

                  // Generate summaries for each response
                  for (const response of responsesToProcess) {
                    const result = await generateSummary(response.conversation);
                    if (result.success && result.summary) {
                      await updateResponseSummary(response.id, result.summary);
                      // Refresh the page after each summary is generated
                      revalidatePath(`/dashboard/surveys/${survey.id}`);
                    }
                  }

                  // Collect all response summaries (including newly generated ones)
                  const allResponseSummaries = currentResponses
                    .filter(r => r.completed_at && r.summary && !r.is_invalid)
                    .map(r => r.summary!);

                  // Generate the survey summary using the response summaries
                  const summary = await generateSurveySummary(
                    survey.objective,
                    survey.orientations,
                    allResponseSummaries
                  );
                  if (summary) {
                    await updateSurveySummary(survey.id, summary);
                    // Final refresh to show the survey summary
                    revalidatePath(`/dashboard/surveys/${survey.id}`);
                  }
                }}>
                  <Button type="submit" variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Survey Summary
                  </Button>
                </form>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-[300px]">
                <p>This will first generate summaries for all completed responses,</p>
                <p>then create a comprehensive survey summary.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responses</CardTitle>
          <CardDescription>
            {responses.length} {responses.length === 1 ? 'response' : 'responses'} collected
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-gray-900">No responses yet</h2>
                  <p className="text-muted-foreground mt-2">Share your survey to start collecting responses</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px]">Respondent</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[60px]">User Msgs</TableHead>
                    <TableHead className="w-[230px]">Conversation</TableHead>
                    <TableHead className="w-[230px]">Summary</TableHead>
                    <TableHead className="w-[100px]">Started</TableHead>
                    <TableHead className="w-[100px]">Completed</TableHead>
                    <TableHead className="w-[80px]">Valid</TableHead>
                    <TableHead className="w-[140px]">Controls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow
                      key={response.id}
                      className={response.is_invalid ? "bg-red-50/50" : undefined}
                    >
                      <TableCell className="max-w-[240px]">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="truncate">{response.respondent_name || 'Anonymous'}</span>
                            {response.respondent_email && (
                              <span className="text-xs text-muted-foreground truncate">
                                {response.respondent_email}
                              </span>
                            )}
                          </div>
                          <div className="shrink-0 mt-0.5">
                            <CopyButton
                              text={response.respondent_email || response.respondent_name || 'Anonymous'}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={response.completed_at ? "default" : "secondary"}>
                          {response.completed_at ? "Completed" : "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {response.conversation.filter((msg: { role: string; }) => msg.role === 'user').length}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Number of user messages in this conversation</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="max-w-[230px] w-[230px]">
                        <ConversationCell conversation={response.conversation} />
                      </TableCell>
                      <TableCell className="max-w-[230px] w-[230px]">
                        <SummaryCell
                          summary={response.summary ?? null}
                          conversation={response.conversation}
                          responseId={response.id}
                          isGenerating={false}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(response.created_at), "PPP")}
                      </TableCell>
                      <TableCell>
                        {response.completed_at ? format(new Date(response.completed_at), "PPP") : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={response.is_invalid ? "destructive" : "default"}
                          className={response.is_invalid
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                          }
                        >
                          {response.is_invalid ? "Invalid" : "Valid"}
                        </Badge>
                      </TableCell>
                      <TableCell className="bg-gray-50/50 border-l">
                        <div className="space-y-3 py-1 px-2">
                          <div className="flex items-center justify-between space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Label
                                    htmlFor={`completed-${response.id}`}
                                    className="text-xs font-medium cursor-help"
                                  >
                                    Completed
                                  </Label>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Toggle to mark this response as completed or incomplete</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <ResponseToggleSwitch
                              id={`completed-${response.id}`}
                              checked={!!response.completed_at}
                              formAction={async () => {
                                "use server";
                                await markResponseAsCompleted(response.id);
                                revalidatePath(`/dashboard/surveys/${survey.id}`);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Label
                                    htmlFor={`valid-${response.id}`}
                                    className="text-xs font-medium cursor-help"
                                  >
                                    Valid
                                  </Label>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Toggle to mark this response as valid or invalid</p>
                                  <p className="text-xs text-muted-foreground mt-1">Invalid responses are excluded from summaries</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <ResponseToggleSwitch
                              id={`valid-${response.id}`}
                              checked={!response.is_invalid}
                              color="red"
                              formAction={async () => {
                                "use server";
                                await toggleResponseValidStatus(response.id);
                                revalidatePath(`/dashboard/surveys/${survey.id}`);
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
