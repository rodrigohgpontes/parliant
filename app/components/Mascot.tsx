'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Base dimensions for the mascot
const BASE_SIZE = 200;

// Sprite positions and dimensions (original sizes)
const SPRITE_MAP = {
    bodies: {
        width: 750,
        height: 750,
        positions: {
            // Yellow bodies (first column)
            yellow: {
                neutral: { x: 300, y: 10 },
                high: { x: 300, y: 700 },
                very_low: { x: 300, y: 1500 },
                very_high: { x: 300, y: 2500 },
                low: { x: 300, y: 3600 }
            },
            // Blue bodies (second column)
            blue: {
                neutral: { x: 1300, y: 0 },
                high: { x: 1300, y: 700 },
                very_low: { x: 1300, y: 1500 },
                very_high: { x: 1300, y: 2500 },
                low: { x: 1300, y: 3600 }
            },
            // Green bodies (third column)
            green: {
                neutral: { x: 2240, y: 0 },
                high: { x: 2300, y: 700 },
                very_low: { x: 2300, y: 1500 },
                very_high: { x: 2300, y: 2500 },
                low: { x: 2300, y: 3600 }
            },
            // Red bodies (fourth column)
            red: {
                neutral: { x: 3170, y: 0 },
                high: { x: 3200, y: 700 },
                very_low: { x: 3200, y: 1500 },
                very_high: { x: 3200, y: 2500 },
                low: { x: 3200, y: 3600 }
            }
        }
    },
    eyes: {
        width: 500,
        height: 500,
        positions: {
            tense: { x: 340, y: 350 },
            absent: { x: 1480, y: 350 },
            uninstered: { x: 2720, y: 350 },
            sad: { x: 3860, y: 340 },
            uncomfortable: { x: 340, y: 1540 },
            angry: { x: 1500, y: 1520 },
            suspicious: { x: 2720, y: 1540 },
            judgemental: { x: 3870, y: 1540 },
            determined: { x: 380, y: 2660 },
            crazy: { x: 1520, y: 2640 },
            bored: { x: 2720, y: 2640 },
        }
    },
    mouths: {
        width: 1200,   // Each mouth sprite is 1200x1200 in a 4800x6000 sheet
        height: 1200,
        positions: {
            closed_satisfied: { x: 0, y: 0 },
            open_jubilous: { x: 1200, y: 0 },
            closed_disappointed: { x: 2400, y: 0 }
        }
    },
    emotes: {
        width: 1200,   // Each emote sprite is 1200x1200 in a 4800x6000 sheet
        height: 1200,
        positions: {
            thinking: { x: 0, y: 0 },
            heart: { x: 1200, y: 0 },
            confused: { x: 2400, y: 0 }
        }
    }
};

const COLORS = ["blue", "green", "red", "yellow"] as const;
const ENERGIES = ["very_low", "low", "neutral", "high", "very_high"] as const;
const EYES = ["tense", "absent", "uninstered", "sad", "uncomfortable", "angry", "suspicious", "judgemental", "determined", "crazy", "bored"] as const;
const MOUTHS = ["closed_satisfied", "open_jubilous", "closed_disappointed"] as const;
const EMOTES = ["thinking", "heart", "confused"] as const;

interface MascotProps {
    color: typeof COLORS[number];
    energy: typeof ENERGIES[number];
    eyes: typeof EYES[number];
    mouth: typeof MOUTHS[number];
    emote?: typeof EMOTES[number];
    className?: string;
}

function MascotControls({
    color,
    energy,
    eyes,
    mouth,
    emote,
    onColorChange,
    onEnergyChange,
    onEyesChange,
    onMouthChange,
    onEmoteChange
}: MascotProps & {
    onColorChange: (color: typeof COLORS[number]) => void;
    onEnergyChange: (energy: typeof ENERGIES[number]) => void;
    onEyesChange: (eyes: typeof EYES[number]) => void;
    onMouthChange: (mouth: typeof MOUTHS[number]) => void;
    onEmoteChange: (emote: typeof EMOTES[number] | undefined) => void;
}) {
    const cycleValue = <T,>(current: T, values: readonly T[], direction: 'next' | 'prev'): T => {
        const currentIndex = values.indexOf(current);
        const nextIndex = direction === 'next'
            ? (currentIndex + 1) % values.length
            : (currentIndex - 1 + values.length) % values.length;
        return values[nextIndex];
    };

    return (
        <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2">
                <span className="w-24">Color:</span>
                <button onClick={() => onColorChange(cycleValue(color, COLORS, 'prev'))} className="px-2 py-1 bg-gray-200 rounded">←</button>
                <span className="w-20 text-center">{color}</span>
                <button onClick={() => onColorChange(cycleValue(color, COLORS, 'next'))} className="px-2 py-1 bg-gray-200 rounded">→</button>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-24">Energy:</span>
                <button onClick={() => onEnergyChange(cycleValue(energy, ENERGIES, 'prev'))} className="px-2 py-1 bg-gray-200 rounded">←</button>
                <span className="w-20 text-center">{energy}</span>
                <button onClick={() => onEnergyChange(cycleValue(energy, ENERGIES, 'next'))} className="px-2 py-1 bg-gray-200 rounded">→</button>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-24">Eyes:</span>
                <button onClick={() => onEyesChange(cycleValue(eyes, EYES, 'prev'))} className="px-2 py-1 bg-gray-200 rounded">←</button>
                <span className="w-20 text-center">{eyes}</span>
                <button onClick={() => onEyesChange(cycleValue(eyes, EYES, 'next'))} className="px-2 py-1 bg-gray-200 rounded">→</button>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-24">Mouth:</span>
                <button onClick={() => onMouthChange(cycleValue(mouth, MOUTHS, 'prev'))} className="px-2 py-1 bg-gray-200 rounded">←</button>
                <span className="w-20 text-center">{mouth}</span>
                <button onClick={() => onMouthChange(cycleValue(mouth, MOUTHS, 'next'))} className="px-2 py-1 bg-gray-200 rounded">→</button>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-24">Emote:</span>
                <button onClick={() => onEmoteChange(emote ? cycleValue(emote, EMOTES, 'prev') : EMOTES[0])} className="px-2 py-1 bg-gray-200 rounded">←</button>
                <span className="w-20 text-center">{emote || 'none'}</span>
                <button onClick={() => onEmoteChange(emote ? cycleValue(emote, EMOTES, 'next') : EMOTES[0])} className="px-2 py-1 bg-gray-200 rounded">→</button>
                <button onClick={() => onEmoteChange(undefined)} className="px-2 py-1 bg-gray-200 rounded">Clear</button>
            </div>
        </div>
    );
}

export default function Mascot({
    color,
    energy,
    eyes,
    mouth,
    emote,
    className = ''
}: MascotProps) {
    const [mounted, setMounted] = useState(false);
    const [currentColor, setCurrentColor] = useState(color);
    const [currentEnergy, setCurrentEnergy] = useState(energy);
    const [currentEyes, setCurrentEyes] = useState(eyes);
    const [currentMouth, setCurrentMouth] = useState(mouth);
    const [currentEmote, setCurrentEmote] = useState(emote);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className={`relative ${className}`} style={{ width: BASE_SIZE, height: BASE_SIZE }}>
                {/* Body */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative" style={{ width: BASE_SIZE, height: BASE_SIZE }}>
                        <Image
                            src="/parly-assets/bodies.png"
                            alt="Mascot body"
                            width={SPRITE_MAP.bodies.width}
                            height={SPRITE_MAP.bodies.height}
                            style={{
                                objectFit: 'none',
                                objectPosition: `-${SPRITE_MAP.bodies.positions[currentColor][currentEnergy].x}px -${SPRITE_MAP.bodies.positions[currentColor][currentEnergy].y}px`,
                                width: `${SPRITE_MAP.bodies.width}px`,
                                height: `${SPRITE_MAP.bodies.height}px`,
                                maxWidth: 'none',
                                transform: `scale(${(BASE_SIZE) / SPRITE_MAP.bodies.width})`,
                                transformOrigin: 'top left'
                            }}
                        />
                    </div>
                </div>

                {/* Eyes */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative" style={{ width: BASE_SIZE, height: BASE_SIZE }}>
                        <Image
                            src="/parly-assets/eyes.png"
                            alt="Mascot eyes"
                            width={SPRITE_MAP.eyes.width}
                            height={SPRITE_MAP.eyes.height}
                            style={{
                                objectFit: 'none',
                                objectPosition: `-${SPRITE_MAP.eyes.positions[currentEyes].x}px -${SPRITE_MAP.eyes.positions[currentEyes].y}px`,
                                width: `${SPRITE_MAP.eyes.width}px`,
                                height: `${SPRITE_MAP.eyes.height}px`,
                                maxWidth: 'none',
                                transform: `scale(${BASE_SIZE / SPRITE_MAP.eyes.width})`,
                                transformOrigin: 'top left'
                            }}
                        />
                    </div>
                </div>

                {/* Mouth */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative" style={{ width: BASE_SIZE, height: BASE_SIZE }}>
                        <Image
                            src="/parly-assets/mouths.png"
                            alt="Mascot mouth"
                            width={SPRITE_MAP.mouths.width}
                            height={SPRITE_MAP.mouths.height}
                            style={{
                                objectFit: 'none',
                                objectPosition: `-${SPRITE_MAP.mouths.positions[currentMouth].x}px -${SPRITE_MAP.mouths.positions[currentMouth].y}px`,
                                width: `${SPRITE_MAP.mouths.width}px`,
                                height: `${SPRITE_MAP.mouths.height}px`,
                                maxWidth: 'none',
                                transform: `scale(${BASE_SIZE / SPRITE_MAP.mouths.width})`,
                                transformOrigin: 'top left'
                            }}
                        />
                    </div>
                </div>

                {/* Emote */}
                {currentEmote && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative" style={{ width: BASE_SIZE, height: BASE_SIZE }}>
                            <Image
                                src="/parly-assets/emotes.png"
                                alt="Mascot emote"
                                width={SPRITE_MAP.emotes.width}
                                height={SPRITE_MAP.emotes.height}
                                style={{
                                    objectFit: 'none',
                                    objectPosition: `-${SPRITE_MAP.emotes.positions[currentEmote].x}px -${SPRITE_MAP.emotes.positions[currentEmote].y}px`,
                                    width: `${SPRITE_MAP.emotes.width}px`,
                                    height: `${SPRITE_MAP.emotes.height}px`,
                                    maxWidth: 'none',
                                    transform: `scale(${BASE_SIZE / SPRITE_MAP.emotes.width})`,
                                    transformOrigin: 'top left'
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            <MascotControls
                color={currentColor}
                energy={currentEnergy}
                eyes={currentEyes}
                mouth={currentMouth}
                emote={currentEmote}
                onColorChange={setCurrentColor}
                onEnergyChange={setCurrentEnergy}
                onEyesChange={setCurrentEyes}
                onMouthChange={setCurrentMouth}
                onEmoteChange={setCurrentEmote}
            />
        </div>
    );
} 