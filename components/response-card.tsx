import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteResponse } from "@/lib/actions/response-actions";

interface Response {
  id: number;
  surveyId: number;
  respondentName: string;
  respondentEmail: string;
  answers: Record<string, string>;
  createdAt: Date;
}

interface ResponseCardProps {
  response: Response;
}

export function ResponseCard({ response }: ResponseCardProps) {
  const formattedDate = new Date(response.createdAt).toLocaleDateString();
  const questions = Object.entries(response.answers).map(([question, answer]) => ({
    question,
    answer
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{response.respondentName || "Anonymous"}</CardTitle>
        <CardDescription>
          {response.respondentEmail && `${response.respondentEmail} • `}
          Submitted on {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.map((item, index) => (
            <div key={index} className="space-y-1">
              <h4 className="text-sm font-medium">{item.question}</h4>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <form
          action={async () => {
            await deleteResponse(response.id);
          }}
        >
          <Button variant="outline" size="icon" type="submit" className="text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete response</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
