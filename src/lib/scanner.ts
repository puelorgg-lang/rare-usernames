
import prisma from "@/lib/prisma"
import { checkUsername } from "@/lib/checker"
import { CATEGORIES, PLATFORMS } from "@/lib/constants"
import { PT_BR_WORDS, EN_US_WORDS } from "@/lib/dictionaries"

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRandomUsername(category: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  
  switch (category) {
    case CATEGORIES.CHARS_2:
      return chars[Math.floor(Math.random() * 26)] + chars[Math.floor(Math.random() * 36)]
    case CATEGORIES.CHARS_3:
      return chars[Math.floor(Math.random() * 26)] + chars[Math.floor(Math.random() * 36)] + chars[Math.floor(Math.random() * 36)]
    case CATEGORIES.CHARS_4:
      return Array(4).fill(0).map(() => chars[Math.floor(Math.random() * 36)]).join("")
    case CATEGORIES.PT_BR:
      // 50% chance of just word, 50% word + small number
      if (Math.random() > 0.5) {
        return getRandomElement(PT_BR_WORDS)
      }
      return getRandomElement(PT_BR_WORDS) + Math.floor(Math.random() * 100)
    case CATEGORIES.EN_US:
      // 50% chance of just word, 50% word + small number
      if (Math.random() > 0.5) {
        return getRandomElement(EN_US_WORDS)
      }
      return getRandomElement(EN_US_WORDS) + Math.floor(Math.random() * 100)
    case CATEGORIES.RANDOM:
    default:
      return "user_" + Math.floor(Math.random() * 10000)
  }
}

export async function runScanner(count: number = 5) {
  const results = []
  
  for (let i = 0; i < count; i++) {
    // Pick random category and platform
    const category = getRandomElement(Object.values(CATEGORIES))
    const platform = getRandomElement(Object.values(PLATFORMS))
    
    // Generate username
    const username = generateRandomUsername(category)
    
    // Check availability (using our checker lib)
    const checkResult = await checkUsername(username, platform)
    
    // If available, save to DB
    if (checkResult.available) {
      try {
        const saved = await prisma.username.upsert({
          where: {
            name_platform: {
              name: username,
              platform: platform
            }
          },
          update: {
            status: "AVAILABLE",
            foundAt: new Date()
          },
          create: {
            name: username,
            platform: platform,
            category: category,
            status: "AVAILABLE",
            foundAt: new Date()
          }
        })
        results.push(saved)
      } catch (e) {
        console.error(`Failed to save ${username}`, e)
      }
    }
  }
  
  return results
}
