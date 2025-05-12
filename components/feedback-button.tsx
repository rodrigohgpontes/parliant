import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export function FeedbackButton() {
    return (
        <Button
            asChild
            className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-4 shadow-lg hover:scale-105 transition-transform duration-200 hover:shadow-xl"
        >
            <a
                href="https://parliant.ai/surveys/51243f16-da3a-4250-8e2c-da1b21dc913d"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white font-semibold"
            >
                <MessageSquarePlus className="h-5 w-5" />
                <span>Give Feedback</span>
            </a>
        </Button>
    );
} 