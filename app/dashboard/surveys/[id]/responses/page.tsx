import { Button } from "@/components/ui/button"
import { ResponseCard } from "@/components/response-card"
import { getResponses } from "@/lib/actions/response-actions"
import { getSurvey } from "@/lib/actions/survey-actions"
import Link from "next/link"
import { ArrowLeft, Share2 } from "lucide-react"
import { notFound } from "next/navigation"

export default async function SurveyResponsesPage({
  params,
}: {
  params: { id: string }
}) {
  const surveyId = Number.parseInt(params.id)
  const survey = await getSurvey(surveyId)

  if (!survey) {
    notFound()
  }

  const responses = await getResponses(surveyId)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/surveys/${surveyId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{survey.title} - Responses</h1>
        </div>
        <Link href={`/dashboard/surveys/${surveyId}/share`}>
          <Button>
            <Share2 className="mr-2 h-4 w-4" />
            Share Survey
          </Button>
        </Link>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-muted-foreground mb-4">No responses yet</h2>
          <p className="text-muted-foreground mb-6">Share your survey to start collecting responses</p>
          <Link href={`/dashboard/surveys/${surveyId}/share`}>
            <Button>
              <Share2 className="mr-2 h-4 w-4" />
              Share Survey
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {responses.map((response) => (
            <ResponseCard key={response.id} response={response} />
          ))}
        </div>
      )}
    </div>
  )
}
