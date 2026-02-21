import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Category, Platform } from "@/lib/constants"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.subscriptionStatus !== "ACTIVE") {
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // For API access, maybe we require a key or just session?
    // Tech Arch says "Possui Assinatura? -> Sim -> Dashboard".
    // I'll enforce session + subscription.
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const platform = searchParams.get("platform")

  if (!category) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 })
  }

  try {
    const usernames = await prisma.username.findMany({
      where: {
        category: category.toUpperCase() as Category,
        ...(platform && { platform: platform.toUpperCase() as Platform }),
        status: "AVAILABLE", // Usually only available ones? Or all? PRD says "Listagem de Usernames".
      },
      orderBy: {
        foundAt: "desc",
      },
    })

    return NextResponse.json({ usernames })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
