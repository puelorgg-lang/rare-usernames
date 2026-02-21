import { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import prisma from "@/lib/prisma"

// Lazy initialization to avoid build-time database connections
export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email || !account?.providerAccountId) {
        return false
      }

      try {
        // Lazy load prisma to avoid build-time connection
        const { default: prisma } = await import("@/lib/prisma")
        // Upsert user in database
        await prisma.user.upsert({
          where: { discordId: account.providerAccountId },
          update: {
            email: user.email,
            image: user.image,
          },
          create: {
            email: user.email,
            discordId: account.providerAccountId,
            image: user.image,
            role: "USER",
            subscriptionStatus: "INACTIVE",
          },
        })
        return true
      } catch (error) {
        console.error("Error saving user", error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Lazy load prisma to avoid build-time connection
        const { default: prisma } = await import("@/lib/prisma")
        // First login, fetch user from DB to get role and subscription
        const dbUser = await prisma.user.findUnique({
          where: { discordId: account.providerAccountId },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.subscriptionStatus = dbUser.subscriptionStatus
          token.subscriptionPlan = dbUser.subscriptionPlan
          token.subscriptionExpiresAt = dbUser.subscriptionExpiresAt
        }
      } else if (token.id) {
        // Lazy load prisma to avoid build-time connection
        const { default: prisma } = await import("@/lib/prisma")
        // Subsequent checks: fetch latest user data from DB using the ID in the token
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        })

        if (dbUser) {
          token.role = dbUser.role
          token.subscriptionStatus = dbUser.subscriptionStatus
          token.subscriptionPlan = dbUser.subscriptionPlan
          token.subscriptionExpiresAt = dbUser.subscriptionExpiresAt
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.subscriptionStatus = token.subscriptionStatus as string
        session.user.subscriptionPlan = token.subscriptionPlan as string
        session.user.subscriptionExpiresAt = token.subscriptionExpiresAt as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
