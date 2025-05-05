import { cn } from "@/lib/utils";
import Image from "next/image";

type ParlyColor = "blue" | "green" | "red" | "yellow";
type ParlyEnergy = "very_low" | "low" | "neutral" | "high" | "very_high";

type ParlyEyes =
    | "atentive"
    | "angry"
    | "suspicious"
    | "sideways"
    | "confused"
    | "act_natural"
    | "buggled"
    | "excited"
    | "crazy"
    | "meditative"
    | "joy"
    | "pain"
    | "sad"
    | "astonished"
    | "annoyed";

type ParlyMouth =
    | "open_delighted"
    | "closed_suspicious"
    | "closed_disappointed"
    | "closed_muted"
    | "open_angry"
    | "open_furious"
    | "open_astonished"
    | "closed_awkward"
    | "closed_shocked"
    | "closed_confused"
    | "closed_frustrated"
    | "open_snarky"
    | "open_jubilous"
    | "closed_emotional"
    | "closed_satisfied"
    | "closed_droopy"
    | "closed_fun"
    | "closed_crazy"
    | "closed_struggling"
    | "open_devastated";

type ParlyEmote =
    | "heart"
    | "stressed"
    | "muted"
    | "confused"
    | "tired"
    | "thinking"
    | "sleeping"
    | "singing"
    | "startled"
    | "astonished"
    | "angry"
    | "furious"
    | "hot"
    | "sweating"
    | "heartbeat"
    | "skull"
    | "fire"
    | "lightning";

interface ParlyProps {
    color?: ParlyColor;
    energy?: ParlyEnergy;
    eyes?: ParlyEyes;
    mouth?: ParlyMouth;
    emote?: ParlyEmote;
    className?: string;
}

export function Parly({
    color = "blue",
    energy = "neutral",
    eyes = "atentive",
    mouth = "closed_satisfied",
    emote,
    className,
}: ParlyProps) {
    // Helper function to get the correct mouth path
    const getMouthPath = (mouth: ParlyMouth) => {
        // Split by underscore and get the state (open/closed) and expression
        const [state, ...expressionParts] = mouth.split('_');
        return `${state}_${expressionParts.join('_')}`;
    };

    return (
        <div className={cn("relative w-48 h-48", className)}>
            {/* Body */}
            <div className="absolute inset-0">
                <Image
                    src={`/parly/parly_body_${energy}_energy_${color}.png`}
                    alt="Parly body"
                    fill
                    className="object-contain"
                />
            </div>

            {/* Eyes */}
            <div className="absolute top-[17%] left-1/2 -translate-x-1/2 w-1/2 aspect-[3/1]">
                <Image
                    src={`/parly/parly_eyes_${eyes}.png`}
                    alt="Parly eyes"
                    fill
                    className="object-contain"
                />
            </div>

            {/* Mouth */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-1/4 aspect-[2/1]">
                <Image
                    src={`/parly/parly_mouth_${getMouthPath(mouth)}.png`}
                    alt="Parly mouth"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* Emote (if provided) */}
            {emote && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-1/3 aspect-square border border-red-500">
                    <Image
                        src={`/parly/parly_emote_${emote}.png`}
                        alt="Parly emote"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            )}
        </div>
    );
} 