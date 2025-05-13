"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ConversationCellProps {
    conversation: any[];
}

export function ConversationCell({ conversation }: ConversationCellProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get the last message content
    const lastMessage = conversation[conversation.length - 1]?.content || '';

    // Count user messages
    const userMessageCount = conversation.filter((msg) => msg.role === 'user').length;

    return (
        <>
            <Button
                variant="ghost"
                className="text-left p-0 h-auto hover:bg-transparent w-full"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="w-full overflow-hidden">
                    <p className="truncate text-sm text-muted-foreground">
                        {lastMessage}
                    </p>
                </div>
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Conversation</span>
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                {userMessageCount} user {userMessageCount === 1 ? 'response' : 'responses'}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-4">
                            {conversation.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-muted rounded-bl-none'
                                            }`}
                                    >
                                        <p className="text-sm font-medium mb-1 opacity-70">
                                            {msg.role === 'user' ? 'You' : 'Assistant'}
                                        </p>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
} 