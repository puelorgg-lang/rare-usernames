import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { discordId, username, messageId, serverId, serverName, channelId, channelName, content, attachments, embeds } = await request.json()

    if (!discordId || !messageId || !serverId || !channelId) {
      return NextResponse.json({ error: "discordId, messageId, serverId, and channelId are required" }, { status: 400 })
    }

    console.log(`💬 Saving message from ${username || discordId} in #${channelName} (${serverName})`)

    // Save the message to database
    const message = await prisma.discordMessage.create({
      data: {
        discordId,
        username,
        messageId,
        serverId,
        serverName,
        channelId,
        channelName,
        content,
        attachments,
        embeds
      }
    })

    return NextResponse.json({ success: true, message })
  } catch (error: any) {
    console.error("Error saving discord message:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET endpoint to retrieve messages for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const discordId = searchParams.get("discordId")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  if (!discordId) {
    return NextResponse.json({ error: "discordId is required" }, { status: 400 })
  }

  try {
    const messages = await prisma.discordMessage.findMany({
      where: { discordId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.discordMessage.count({
      where: { discordId }
    })

    return NextResponse.json({ messages, total })
  } catch (error: any) {
    console.error("Error fetching discord messages:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
