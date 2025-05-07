'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { COLORS, ENERGIES, EYES, MOUTHS, EMOTES, MascotColor, MascotEnergy, MascotEyes, MascotMouth, MascotEmote } from '@/app/lib/mascot-constants';

// Base dimensions for the mascot
const BASE_SIZE = 200;

// Sprite positions and dimensions (original sizes)
const BODY_POSITIONS = {
    yellow: {
        neutral: { x: 300, y: 10 },
        high: { x: 300, y: 700 },
        very_low: { x: 300, y: 1500 },
        very_high: { x: 300, y: 2500 },
        low: { x: 300, y: 3600 }
    },
    blue: {
        neutral: { x: 1300, y: 0 },
        high: { x: 1300, y: 700 },
        very_low: { x: 1300, y: 1500 },
        very_high: { x: 1300, y: 2500 },
        low: { x: 1300, y: 3600 }
    },
    green: {
        neutral: { x: 2240, y: 0 },
        high: { x: 2240, y: 700 },
        very_low: { x: 2300, y: 1500 },
        very_high: { x: 2300, y: 2500 },
        low: { x: 2300, y: 3600 }
    },
    red: {
        neutral: { x: 3170, y: 0 },
        high: { x: 3180, y: 700 },
        very_low: { x: 3200, y: 1500 },
        very_high: { x: 3200, y: 2500 },
        low: { x: 3200, y: 3600 }
    }
} as const;

const EYE_POSITIONS = {
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
    bored: { x: 2720, y: 2640 }
} as const;

const MOUTH_POSITIONS = {
    happy: { x: 0, y: 0 },
    unresponsive: { x: 1200, y: 0 },
    sad: { x: 2400, y: 0 },
    quiet: { x: 3600, y: 0 },
    suffering: { x: 0, y: 1200 },
    smirky: { x: 1200, y: 1200 },
    tense: { x: 2400, y: 1200 },
    nervous: { x: 3600, y: 1200 },
    overwhelmed: { x: 0, y: 2240 },
    cute: { x: 1200, y: 2240 },
    shocked: { x: 2400, y: 2240 },
    disappointed: { x: 3600, y: 2240 },
    joyful: { x: 0, y: 3600 },
    scared: { x: 1200, y: 3600 },
    uncomfortable: { x: 2400, y: 3540 },
    embarassed: { x: 3600, y: 3540 },
    frown: { x: 0, y: 4720 },
    surprised: { x: 1200, y: 4720 },
    regret: { x: 2400, y: 4720 },
    fun: { x: 3600, y: 4720 },
} as const;

const EMOTE_POSITIONS = {
    thinking: { x: 0, y: 0 },
    heart: { x: 1200, y: 0 },
    confused: { x: 2400, y: 0 }
} as const;

const SPRITE_MAP = {
    bodies: {
        width: 750,
        height: 750,
        positions: BODY_POSITIONS
    },
    eyes: {
        width: 500,
        height: 500,
        positions: EYE_POSITIONS
    },
    mouths: {
        width: 1200,
        height: 1200,
        positions: MOUTH_POSITIONS
    },
    emotes: {
        width: 1200,
        height: 1200,
        positions: EMOTE_POSITIONS
    }
} as const;

interface MascotProps {
    color: MascotColor;
    energy: MascotEnergy;
    eyes: MascotEyes;
    mouth: MascotMouth;
    emote?: MascotEmote;
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
    onColorChange: (color: MascotColor) => void;
    onEnergyChange: (energy: MascotEnergy) => void;
    onEyesChange: (eyes: MascotEyes) => void;
    onMouthChange: (mouth: MascotMouth) => void;
    onEmoteChange: (emote: MascotEmote | undefined) => void;
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
                                objectPosition: `-${SPRITE_MAP.mouths.positions[currentMouth]?.x}px -${SPRITE_MAP.mouths.positions[currentMouth]?.y}px`,
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