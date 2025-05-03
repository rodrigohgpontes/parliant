import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteResponse } from "@/lib/actions/response-actions";

interface Response {
  id: number;
  survey_id: number;
  data: any;
  respondent_id: string;
  respondent_name: string;
  respondent_email: string;
  completed_at: Date;
}

interface ResponseCardProps {
  response: Response;
}

export function ResponseCard({ response }: ResponseCardProps) {
  const formattedDate = new Date(response.completed_at).toLocaleDateString();
  const answers = response.data || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>{response.respondent_name || "Anonymous"}</CardTitle>
        <CardDescription>
          {response.respondent_email && `${response.respondent_email} • `}
          Submitted on {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(answers).map(([question, answer], index) => (
            <div key={index} className="space-y-1">
              <h4 className="text-sm font-medium">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer as string}</p>
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
