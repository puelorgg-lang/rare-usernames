
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Constants to match string fields in schema
const PLATFORMS = {
  DISCORD: "DISCORD",
  MINECRAFT: "MINECRAFT",
  ROBLOX: "ROBLOX",
  GITHUB: "GITHUB",
  TWITTER: "TWITTER",
  INSTAGRAM: "INSTAGRAM",
  TIKTOK: "TIKTOK",
}

const CATEGORIES = {
  CHARS_2: "CHARS_2",
  CHARS_3: "CHARS_3",
  CHARS_4: "CHARS_4",
  PT_BR: "PT_BR",
  EN_US: "EN_US",
  RANDOM: "RANDOM",
}

const STATUS = {
  AVAILABLE: "AVAILABLE",
  TAKEN: "TAKEN",
  CHECKING: "CHECKING",
  ERROR: "ERROR",
}

async function main() {
  console.log('Starting seed...')

  // Create test user
  // Using a UUID for discordId to avoid conflict if you actually login
  // But for testing, it's fine.
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      discordId: 'mock-discord-id-123', 
      image: 'https://github.com/shadcn.png',
      role: 'ADMIN',
      subscriptionStatus: 'ACTIVE',
      subscriptionPlan: 'MONTHLY',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })
  console.log({ user })

  // Create mock usernames
  const usernames = [
    // 2 CHARS
    { name: 'ab', platform: PLATFORMS.DISCORD, category: CATEGORIES.CHARS_2, status: STATUS.AVAILABLE },
    { name: 'xy', platform: PLATFORMS.TWITTER, category: CATEGORIES.CHARS_2, status: STATUS.TAKEN },
    { name: 'go', platform: PLATFORMS.GITHUB, category: CATEGORIES.CHARS_2, status: STATUS.AVAILABLE },
    
    // 3 CHARS
    { name: 'abc', platform: PLATFORMS.DISCORD, category: CATEGORIES.CHARS_3, status: STATUS.AVAILABLE },
    { name: 'dev', platform: PLATFORMS.GITHUB, category: CATEGORIES.CHARS_3, status: STATUS.AVAILABLE },
    { name: 'cat', platform: PLATFORMS.INSTAGRAM, category: CATEGORIES.CHARS_3, status: STATUS.CHECKING },

    // 4 CHARS
    { name: 'cool', platform: PLATFORMS.TIKTOK, category: CATEGORIES.CHARS_4, status: STATUS.AVAILABLE },
    { name: 'rare', platform: PLATFORMS.MINECRAFT, category: CATEGORIES.CHARS_4, status: STATUS.AVAILABLE },
    
    // PT-BR
    { name: 'futebol', platform: PLATFORMS.TWITTER, category: CATEGORIES.PT_BR, status: STATUS.AVAILABLE },
    { name: 'brasil', platform: PLATFORMS.DISCORD, category: CATEGORIES.PT_BR, status: STATUS.TAKEN },
    
    // EN-US
    { name: 'shadow', platform: PLATFORMS.ROBLOX, category: CATEGORIES.EN_US, status: STATUS.AVAILABLE },
    { name: 'ghost', platform: PLATFORMS.MINECRAFT, category: CATEGORIES.EN_US, status: STATUS.AVAILABLE },
    
    // RANDOM
    { name: 'super_rare_123', platform: PLATFORMS.DISCORD, category: CATEGORIES.RANDOM, status: STATUS.AVAILABLE },
  ]

  for (const u of usernames) {
    const username = await prisma.username.upsert({
      where: { name_platform: { name: u.name, platform: u.platform } },
      update: {},
      create: {
        name: u.name,
        platform: u.platform,
        category: u.category,
        status: u.status,
        foundAt: new Date(),
      },
    })
    console.log(`Created username: ${username.name} on ${username.platform}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
