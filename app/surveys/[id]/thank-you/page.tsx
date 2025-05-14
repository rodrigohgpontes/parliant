import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db/index";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
export default async function ThankYouPage({
  params,
}: {
  params: { id: string; };
}) {
  const surveyId = Number.parseInt(params.id);

  // Get the survey without checking user ownership
  const surveyResults = await db`
    SELECT * FROM surveys 
    WHERE id = ${surveyId}
  `;

  const survey = surveyResults[0];

  if (!survey) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>Your response has been submitted successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We appreciate your feedback for "{survey.title}". Your insights will help us improve.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
