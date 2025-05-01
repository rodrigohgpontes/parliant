import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Survey } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { BarChart, Edit, Share2, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteSurvey } from "@/lib/actions/survey-actions"

interface SurveyCardProps {
  survey: Survey
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const formattedDate = new Date(survey.createdAt).toLocaleDateString()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
        <CardDescription>Created on {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{survey.description || "No description provided."}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Link href={`/dashboard/surveys/${survey.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        <Link href={`/dashboard/surveys/${survey.id}/responses`}>
          <Button variant="outline" size="sm">
            <BarChart className="mr-1 h-4 w-4" />
            Responses
          </Button>
        </Link>
        <div className="ml-auto flex gap-2">
          <Link href={`/dashboard/surveys/${survey.id}/share`}>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/surveys/${survey.id}/edit`}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <form
            action={async () => {
              await deleteSurvey(survey.id)
            }}
          >
            <Button variant="outline" size="icon" type="submit" className="text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  )
}
