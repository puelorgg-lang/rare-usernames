import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { discordId, username, displayName, avatar, banner, tag, status } = await request.json()

    if (!discordId || !username) {
      return NextResponse.json({ error: "discordId e username são obrigatórios" }, { status: 400 })
    }

    // Upsert user search data
    const userSearch = await prisma.userSearch.upsert({
      where: { discordId },
      update: {
        username,
        displayName,
        avatar,
        banner,
        tag,
        status,
        updatedAt: new Date(),
      },
      create: {
        discordId,
        username,
        displayName,
        avatar,
        banner,
        tag,
        status,
      },
    })

    return NextResponse.json({ success: true, userSearch })
  } catch (error: any) {
    console.error("Error saving user search:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const discordId = searchParams.get("discordId")

  if (!discordId) {
    return NextResponse.json({ error: "discordId é obrigatório" }, { status: 400 })
  }

  try {
    const userSearch = await prisma.userSearch.findUnique({
      where: { discordId },
    })

    return NextResponse.json(userSearch)
  } catch (error: any) {
    console.error("Error fetching user search:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
