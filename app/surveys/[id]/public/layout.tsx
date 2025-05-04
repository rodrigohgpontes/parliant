import { Header } from "@/components/header";

export default function PublicSurveyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            {children}
        </div>
    );
} 