"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { CalendarDays } from 'lucide-react';

interface Response {
    survey_id: string;
    completed_at: string;
}

interface Survey {
    id: string;
    objective: string;
}

interface ActivityChartProps {
    responses: Response[];
    surveys: Survey[];
}

// Deterministic color generator based on UUID
export function getColorFromId(id: string): string {
    const hash = id.split('').reduce((acc: number, char: string) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
}

export function ActivityChart({ responses, surveys }: ActivityChartProps) {
    const [daysToShow, setDaysToShow] = useState<7 | 30>(7);

    const chartData = useMemo(() => {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - daysToShow);

        // Filter responses within the date range
        const filteredResponses = responses.filter(response => {
            const responseDate = new Date(response.completed_at);
            return responseDate >= startDate && responseDate <= now;
        });

        // Create a map of dates to response counts
        const dateMap = new Map<string, { [key: string]: number; }>();

        // Initialize all dates in the range
        for (let i = 0; i <= daysToShow; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dateMap.set(dateStr, {});
        }

        // Count responses for each survey on each date
        filteredResponses.forEach(response => {
            const date = new Date(response.completed_at).toISOString().split('T')[0];
            const surveyId = response.survey_id;

            if (!dateMap.has(date)) {
                dateMap.set(date, {});
            }

            const dateData = dateMap.get(date)!;
            dateData[surveyId] = (dateData[surveyId] || 0) + 1;
        });

        // Convert to array format for Recharts
        return Array.from(dateMap.entries())
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, surveyCounts]) => {
                const data: { [key: string]: any; } = { date };
                surveys.forEach(survey => {
                    data[survey.objective] = surveyCounts[survey.id] || 0;
                });
                return data;
            });
    }, [responses, surveys, daysToShow]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <ToggleGroup
                    type="single"
                    value={daysToShow.toString()}
                    onValueChange={(value) => setDaysToShow(value === "7" ? 7 : 30)}
                    className="bg-muted p-1 rounded-lg"
                >
                    <ToggleGroupItem
                        value="7"
                        className="data-[state=on]:bg-background data-[state=on]:text-foreground"
                    >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        7 days
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="30"
                        className="data-[state=on]:bg-background data-[state=on]:text-foreground"
                    >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        30 days
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => {
                                const d = new Date(date);
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(date) => {
                                const d = new Date(date);
                                return d.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                });
                            }}
                        />
                        {surveys.map(survey => (
                            <Bar
                                key={survey.id}
                                dataKey={survey.objective}
                                stackId="a"
                                fill={getColorFromId(survey.id)}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 