import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"

export type { Session } from "next-auth"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return null
  }
  
  // Find user by discord ID (stored as id in session)
  const user = await prisma.user.findUnique({
    where: { discordId: session.user.id }
  })
  
  return user
}

export async function isPremiumUser(): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }
  
  // Check if subscription is active and not expired
  if (user.subscriptionStatus !== "ACTIVE") {
    return false
  }
  
  // Check if subscription has expired
  if (user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt) {
    return false
  }
  
  return true
}

// Free categories that don't require subscription
export const FREE_CATEGORIES = [
  'FEED',
  '4C',
  'PT_BR_2',
  'PONCTUATED',
  'EN_US_2',
  'REPEATERS',
  'FACE',
  '4L',
  '3C',
  '4N',
  '3L',
]

// Premium categories that require active subscription
export const PREMIUM_CATEGORIES = [
  'CHARS_2',
  'CHARS_3',
  'CHARS_4',
  'PT_BR',
  'EN_US',
  'RANDOM',
]

export function isCategoryFree(category: string): boolean {
  return FREE_CATEGORIES.includes(category.toUpperCase())
}

export function isCategoryPremium(category: string): boolean {
  return PREMIUM_CATEGORIES.includes(category.toUpperCase())
}
