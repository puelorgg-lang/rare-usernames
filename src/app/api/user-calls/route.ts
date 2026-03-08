import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET endpoint to retrieve call history for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const discordId = searchParams.get("discordId")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  if (!discordId) {
    return NextResponse.json({ error: "discordId is required" }, { status: 400 })
  }

  try {
    const calls = await prisma.voiceCall.findMany({
      where: { discordId },
      orderBy: { joinedAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.voiceCall.count({
      where: { discordId }
    })

    // Also get active call if exists
    const activeCall = await prisma.activeVoiceCall.findUnique({
      where: { discordId }
    })

    return NextResponse.json({ calls, total, activeCall })
  } catch (error: any) {
    console.error("Error fetching user calls:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
