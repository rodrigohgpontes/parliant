import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: 'noindex, nofollow',
    title: 'Survey Response - Parliant.AI',
    description: 'Respond to survey'
};

export default function SurveysLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 