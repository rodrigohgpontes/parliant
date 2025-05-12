import { FeedbackButton } from "@/components/feedback-button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <FeedbackButton />
        </>
    );
} 