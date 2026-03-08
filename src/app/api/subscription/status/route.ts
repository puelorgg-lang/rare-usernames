import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is premium
  let isPremium = false
  const subscriptionStatus = (session.user as any)?.subscriptionStatus
  const subscriptionExpiresAt = (session.user as any)?.subscriptionExpiresAt
  
  if (subscriptionStatus === "ACTIVE") {
    if (subscriptionExpiresAt) {
      const expires = new Date(subscriptionExpiresAt)
      if (expires > new Date()) {
        isPremium = true
      }
    } else {
      // No expiration means lifetime premium
      isPremium = true
    }
  }

  return NextResponse.json({
    isPremium,
    status: subscriptionStatus,
    plan: (session.user as any)?.subscriptionPlan,
    expires_at: subscriptionExpiresAt,
  })
}
