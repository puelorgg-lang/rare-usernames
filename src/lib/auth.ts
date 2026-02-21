import { NextAuthOptions, Profile } from "next-auth"
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
      // For Discord, the user ID is in account.providerAccountId
      if (account?.provider === "discord" && account.providerAccountId) {
        try {
          await prisma.user.upsert({
            where: { discordId: account.providerAccountId },
            update: {
              email: user.email ?? "",
              image: user.image ?? null,
            },
            create: {
              discordId: account.providerAccountId,
              email: user.email ?? "",
              image: user.image ?? null,
              role: "USER",
              subscriptionStatus: "INACTIVE",
            },
          })
        } catch (error) {
          console.error("Error creating user:", error)
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
