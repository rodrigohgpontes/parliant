"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface EditableFixedQuestionsProps {
    questions: string[] | null;
    onSave: (questions: string[]) => Promise<void>;
}

export function EditableFixedQuestions({ questions, onSave }: EditableFixedQuestionsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [values, setValues] = useState<string[]>(questions || [""]);

    const handleSave = async () => {
        // Filter out empty questions
        const nonEmptyQuestions = values.filter(q => q.trim());
        await onSave(nonEmptyQuestions);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setValues(questions || [""]);
        setIsEditing(false);
    };

    const addQuestion = () => {
        if (values.length < 3) {
            setValues([...values, ""]);
        }
    };

    const removeQuestion = (index: number) => {
        if (values.length > 1) {
            const newValues = values.filter((_, i) => i !== index);
            setValues(newValues.length > 0 ? newValues : [""]);
        }
    };

    const updateQuestion = (index: number, value: string) => {
        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);
    };

    if (isEditing) {
        return (
            <div className="space-y-4">
                {values.map((question, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`fixed-question-${index}`}>
                                Fixed Question {index + 1}
                            </Label>
                            {values.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeQuestion(index)}
                                    className="h-8 px-2"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        <Textarea
                            id={`fixed-question-${index}`}
                            value={question}
                            onChange={(e) => updateQuestion(index, e.target.value)}
                            className="min-h-[80px]"
                            placeholder={`Enter fixed question ${index + 1}...`}
                        />
                    </div>
                ))}

                {values.length < 3 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addQuestion}
                        className="w-full"
                    >
                        Add Another Fixed Question
                    </Button>
                )}

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
                    <span className="sr-only">Edit fixed questions</span>
                </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 pr-8">
                {questions && questions.length > 0 ? (
                    <div className="space-y-2">
                        {questions.map((question, index) => (
                            <div key={index} className="p-2 bg-background rounded border">
                                <strong>Question {index + 1}:</strong> {question}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">
                        No fixed questions defined. Click the edit button to add some.
                    </p>
                )}
            </div>
        </div>
    );
} 