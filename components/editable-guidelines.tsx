"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface EditableGuidelinesProps {
    guidelines: string | null;
    onSave: (guidelines: string) => Promise<void>;
}

export function EditableGuidelines({ guidelines, onSave }: EditableGuidelinesProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(guidelines || "");

    const handleSave = async () => {
        await onSave(value);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setValue(guidelines || "");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-2">
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="min-h-[100px]"
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
                    <span className="sr-only">Edit guidelines</span>
                </Button>
            </div>
            <div className="whitespace-pre-wrap text-muted-foreground pr-8">
                {guidelines || "No guidelines provided."}
            </div>
        </div>
    );
} 