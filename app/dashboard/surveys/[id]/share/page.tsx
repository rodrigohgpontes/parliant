import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSurvey } from "@/lib/actions/survey-actions";
import { ArrowLeft, Copy, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ShareSurveyPage({
  params,
}: {
  params: { id: string; };
}) {
  const surveyId = params.id;
  const survey = await getSurvey(surveyId);

  if (!survey) {
    notFound();
  }

  const surveyUrl = `${process.env.AUTH0_BASE_URL}/surveys/${surveyId}`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/surveys/${surveyId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Share Survey</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          <CardDescription>Share your survey with respondents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Survey Link</h3>
            <div className="flex gap-2">
              <Input value={surveyUrl} readOnly className="flex-1" />
              <Button variant="outline" size="icon" className="shrink-0">
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Share this link with your respondents to collect responses.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Share via Email</h3>
            <Button className="w-full sm:w-auto">
              <Mail className="mr-2 h-4 w-4" />
              Send Email Invitation
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Embed on Website</h3>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-xs break-all">
                {`<iframe src="${surveyUrl}/embed" width="100%" height="600" frameborder="0"></iframe>`}
              </code>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/dashboard/surveys/${surveyId}`}>
            <Button variant="outline">View Survey</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
