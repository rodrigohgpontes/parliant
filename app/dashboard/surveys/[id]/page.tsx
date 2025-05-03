import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSurveyServerAction } from "@/lib/actions/survey-server-actions";
import { getResponsesServer } from "@/lib/actions/server-data-actions";
import { Edit, Share2, ArrowLeft, BarChart, Users, Clock, Activity } from "lucide-react";
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

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string; }>;
}) {
  const { id } = await params;
  const survey = await getSurveyServerAction(id);
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
          <h1 className="text-3xl font-bold">{survey.title}</h1>
          <p className="text-muted-foreground mt-1">Survey details and responses</p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Link href={`/dashboard/surveys/${survey.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Survey
            </Button>
          </Link>
          <Link href={`/dashboard/surveys/${survey.id}/share`}>
            <Button>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </Link>
        </div>
      </div>

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
            <Badge variant={survey.is_active ? "default" : "secondary"}>
              {survey.is_active ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {survey.is_active ? 'Survey is accepting responses' : 'Survey is not accepting responses'}
            </p>
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

      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
          <CardDescription>
            {survey.description || "No description provided."}
          </CardDescription>
        </CardHeader>
      </Card>

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
                <Link href={`/dashboard/surveys/${survey.id}/share`}>
                  <Button>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Survey
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">{response.respondent_name || "Anonymous"}</TableCell>
                      <TableCell>{response.respondent_email || "-"}</TableCell>
                      <TableCell>{new Date(response.completed_at).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {typeof response.data === 'object' ? JSON.stringify(response.data) : response.data}
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
