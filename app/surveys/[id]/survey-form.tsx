"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSurveyResponse } from "./actions";

interface SurveyFormProps {
    survey: {
        id: number;
        title: string;
        description?: string;
    };
}

export default function SurveyForm({ survey }: SurveyFormProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                </CardHeader>
                <form action={(formData) => createSurveyResponse(survey.id, formData)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@example.com" />
                        </div>

                        {/* In a real implementation, this would be dynamically generated based on the survey questions */}
                        <div className="space-y-2 pt-4">
                            <Label htmlFor="q1">How would you rate our service?</Label>
                            <div className="flex flex-wrap gap-2">
                                {["Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"].map((option) => (
                                    <Button
                                        key={option}
                                        type="button"
                                        variant="outline"
                                        className="rounded-full"
                                        onClick={() => {
                                            // In a real implementation, this would update the form state
                                            console.log(option);
                                        }}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="q2">What improvements would you suggest?</Label>
                            <textarea
                                id="q2"
                                name="q2"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Your feedback helps us improve"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Submit Response
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 