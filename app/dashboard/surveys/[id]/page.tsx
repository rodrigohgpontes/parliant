import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSurvey } from "@/lib/actions/survey-actions"
import { Edit, BarChart, Share2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function SurveyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const survey = await getSurvey(Number.parseInt(params.id))

  if (!survey) {
    notFound()
  }

  const formattedCreatedDate = new Date(survey.createdAt).toLocaleDateString()
  const formattedUpdatedDate = new Date(survey.updatedAt).toLocaleDateString()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{survey.title}</h1>
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

      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
          <CardDescription>
            Created on {formattedCreatedDate} • Last updated on {formattedUpdatedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">{survey.description || "No description provided."}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1">
                {survey.isActive ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href={`/dashboard/surveys/${survey.id}/responses`}>
            <Button>
              <BarChart className="mr-2 h-4 w-4" />
              View Responses
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
