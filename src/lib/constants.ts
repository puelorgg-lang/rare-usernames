
export const PLATFORMS = {
  DISCORD: "DISCORD",
  MINECRAFT: "MINECRAFT",
  ROBLOX: "ROBLOX",
  GITHUB: "GITHUB",
  TWITTER: "TWITTER",
  INSTAGRAM: "INSTAGRAM",
  TIKTOK: "TIKTOK",
  URLS: "URLS",
} as const;

export type Platform = keyof typeof PLATFORMS;

export const CATEGORIES = {
  CHARS_2: "CHARS_2",
  CHARS_3: "CHARS_3",
  CHARS_4: "CHARS_4",
  PT_BR: "PT_BR",
  EN_US: "EN_US",
  RANDOM: "RANDOM",
  // New Premium Categories
  "4C": "4C",
  PT_BR_2: "PT_BR_2",
  PONCTUATED: "PONCTUATED",
  EN_US_2: "EN_US_2",
  REPEATERS: "REPEATERS",
  FACE: "FACE",
  "4L": "4L",
  "3C": "3C",
  "4N": "4N",
  "3L": "3L",
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_LABELS: Record<string, string> = {
  CHARS_2: "2 Caracteres",
  CHARS_3: "3 Caracteres",
  CHARS_4: "4 Caracteres",
  PT_BR: "Palavras PT-BR",
  EN_US: "Palavras EN-US",
  RANDOM: "Aleatórios",
  // New Premium Categories
  "4C": "4C",
  PT_BR_2: "PT-BR",
  PONCTUATED: "Ponctuated",
  EN_US_2: "EN-US",
  REPEATERS: "Repeaters",
  FACE: "FACE",
  "4L": "4L",
  "3C": "3C",
  "4N": "4N",
  "3L": "3L",
};
