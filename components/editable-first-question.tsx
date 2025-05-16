"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface EditableFirstQuestionProps {
    question: string | null;
    onSave: (question: string) => Promise<void>;
}

export function EditableFirstQuestion({ question, onSave }: EditableFirstQuestionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(question || "");

    const handleSave = async () => {
        await onSave(value);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setValue(question || "");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-2">
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="min-h-[100px]"
                    placeholder="Enter the first question that will be asked to respondents..."
                />
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group">
            <div className="absolute right-0 top-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsEditing(true)}
                >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit first question</span>
                </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap pr-8">
                {question || "No initial question defined. Click the edit button to add one."}
            </div>
        </div>
    );
} 