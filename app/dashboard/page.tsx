import { Button } from "@/components/ui/button";
import { SurveyCard } from "@/components/survey-card";
import { getSurveysServer } from "@/lib/actions/server-data-actions";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const surveys = await getSurveysServer();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Surveys</h1>
        <Link href="/dashboard/surveys/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600 mb-4">You don't have any surveys yet</h2>
          <p className="text-gray-500 mb-6">Create your first survey to start collecting insights</p>
          <Link href="/dashboard/surveys/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Survey
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      )}
    </div>
  );
}
