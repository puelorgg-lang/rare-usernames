
export const PLATFORMS = {
  DISCORD: "DISCORD",
  MINECRAFT: "MINECRAFT",
  ROBLOX: "ROBLOX",
  GITHUB: "GITHUB",
  TWITTER: "TWITTER",
  INSTAGRAM: "INSTAGRAM",
  TIKTOK: "TIKTOK",
} as const;

export type Platform = keyof typeof PLATFORMS;

export const CATEGORIES = {
  CHARS_2: "CHARS_2",
  CHARS_3: "CHARS_3",
  CHARS_4: "CHARS_4",
  PT_BR: "PT_BR",
  EN_US: "EN_US",
  RANDOM: "RANDOM",
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_LABELS: Record<Category, string> = {
  CHARS_2: "2 Caracteres",
  CHARS_3: "3 Caracteres",
  CHARS_4: "4 Caracteres",
  PT_BR: "Palavras PT-BR",
  EN_US: "Palavras EN-US",
  RANDOM: "Aleatórios",
};
