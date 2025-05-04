import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversation: Message[];
}

export function ConversationModal({ isOpen, onClose, conversation }: ConversationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Survey Conversation</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                        {conversation.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "p-4 rounded-lg",
                                    message.role === 'user'
                                        ? "bg-primary/10 ml-8"
                                        : "bg-muted mr-8"
                                )}
                            >
                                <div className="font-medium mb-1">
                                    {message.role === 'user' ? 'Respondent' : 'Assistant'}
                                </div>
                                <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
} 