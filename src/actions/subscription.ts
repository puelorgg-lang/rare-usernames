"use server"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function upgradeSubscription(plan: "DAILY" | "WEEKLY" | "MONTHLY") {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  // Mock payment processing...
  // In real app, create Stripe checkout session here.

  const daysToAdd = plan === "DAILY" ? 1 : plan === "WEEKLY" ? 7 : 30
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + daysToAdd)

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: plan,
      subscriptionExpiresAt: expiresAt,
      role: "USER", // Or keep existing role
    },
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
