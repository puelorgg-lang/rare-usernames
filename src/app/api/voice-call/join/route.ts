import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { discordId, username, serverId, serverName, channelId, channelName, channelType } = await request.json()

    if (!discordId || !channelId || !serverId) {
      return NextResponse.json({ error: "discordId, channelId, and serverId are required" }, { status: 400 })
    }

    console.log(`🎤 Voice call join: ${username || discordId} joined ${channelName} in ${serverName}`)

    // Deactivate any previous active call for this user
    await prisma.activeVoiceCall.updateMany({
      where: { discordId },
      data: { updatedAt: new Date() }
    })

    // Create new active voice call
    const activeCall = await prisma.activeVoiceCall.upsert({
      where: { discordId },
      update: {
        username,
        serverId,
        serverName,
        channelId,
        channelName,
        joinedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        discordId,
        username,
        serverId,
        serverName,
        channelId,
        channelName,
        joinedAt: new Date()
      }
    })

    // Also create a voice call history record
    const voiceCall = await prisma.voiceCall.create({
      data: {
        discordId,
        username,
        serverId,
        serverName,
        channelId,
        channelName,
        channelType: channelType || 'VOICE',
        joinedAt: new Date(),
        isActive: true
      }
    })

    return NextResponse.json({ success: true, activeCall, voiceCall })
  } catch (error: any) {
    console.error("Error saving voice call join:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
