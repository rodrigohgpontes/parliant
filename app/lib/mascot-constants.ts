export const COLORS = ["blue", "green", "red", "yellow"] as const;
export const ENERGIES = ["very_low", "low", "neutral", "high", "very_high"] as const;
export const EYES = ["tense", "absent", "uninstered", "sad", "uncomfortable", "angry", "suspicious", "judgemental", "determined", "crazy", "bored"] as const;
export const MOUTHS = ["happy", "unresponsive", "sad", "quiet", "suffering", "smirky", "tense", "nervous", "overwhelmed", "cute", "shocked", "disappointed", "joyful", "scared", "uncomfortable", "embarassed", "frown", "surprised", "regret", "fun"] as const;
export const EMOTES = ["thinking", "heart", "confused"] as const;

export type MascotColor = typeof COLORS[number];
export type MascotEnergy = typeof ENERGIES[number];
export type MascotEyes = typeof EYES[number];
export type MascotMouth = typeof MOUTHS[number];
export type MascotEmote = typeof EMOTES[number]; 