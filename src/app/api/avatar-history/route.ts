import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { discordId, avatarUrl } = await request.json()

    if (!discordId || !avatarUrl) {
      return NextResponse.json({ error: "discordId e avatarUrl são obrigatórios" }, { status: 400 })
    }

    console.log('💾 Saving avatar to database:', discordId, avatarUrl);

    // Check if this avatar already exists for this user
    const existing = await prisma.avatarHistory.findFirst({
      where: {
        discordId,
        avatarUrl,
      },
    })

    if (!existing) {
      // Save new avatar
      await prisma.avatarHistory.create({
        data: {
          discordId,
          avatarUrl,
          changedAt: new Date(),
        },
      })
      console.log('✅ New avatar saved to history');
    } else {
      console.log('⏭️ Avatar already exists in history, skipping');
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving avatar:", error)
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
    const avatars = await prisma.avatarHistory.findMany({
      where: { discordId },
      orderBy: { changedAt: "desc" },
    })

    return NextResponse.json(avatars)
  } catch (error: any) {
    console.error("Error fetching avatars:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
