import { notFound } from "next/navigation";
import { getSurvey } from "./actions";
import SurveyForm from "./survey-form";

export default async function SurveyPage({
  params,
}: {
  params: { id: string; };
}) {
  const surveyId = Number.parseInt(params.id);
  const survey = await getSurvey(surveyId);

  if (!survey) {
    notFound();
  }

  return <SurveyForm survey={survey} />;
}
