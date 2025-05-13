"use client";

import { useRef, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface ResponseToggleSwitchProps {
    id: string;
    checked: boolean;
    color?: "green" | "red";
    formAction: () => Promise<void>;
}

export function ResponseToggleSwitch({
    id,
    checked,
    color = "green",
    formAction
}: ResponseToggleSwitchProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();

    return (
        <div className="relative">
            <form
                ref={formRef}
                action={() => startTransition(() => { formAction(); })}
            >
                <Switch
                    id={id}
                    checked={checked}
                    disabled={isPending}
                    className={
                        color === "green"
                            ? "data-[state=checked]:bg-green-500"
                            : "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    }
                    onCheckedChange={() => {
                        formRef.current?.requestSubmit();
                    }}
                />
                <button type="submit" className="sr-only">Submit</button>
            </form>
            {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-full">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
} 