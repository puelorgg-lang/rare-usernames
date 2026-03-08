import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { discordId, username, serverId, serverName, channelId, channelName } = await request.json()

    if (!discordId || !channelId) {
      return NextResponse.json({ error: "discordId and channelId are required" }, { status: 400 })
    }

    console.log(`🔌 Voice call leave: ${username || discordId} left ${channelName} in ${serverName}`)

    // Find and deactivate the active voice call
    const activeCall = await prisma.activeVoiceCall.findFirst({
      where: { 
        discordId,
        channelId
      }
    })

    if (activeCall) {
      // Calculate duration
      const joinedAt = new Date(activeCall.joinedAt);
      const leftAt = new Date();
      const duration = Math.floor((leftAt.getTime() - joinedAt.getTime()) / 1000);

      // Update the active call to mark as inactive
      await prisma.activeVoiceCall.delete({
        where: { id: activeCall.id }
      })

      // Update the voice call history record
      await prisma.voiceCall.updateMany({
        where: {
          discordId,
          channelId,
          isActive: true
        },
        data: {
          leftAt: new Date(),
          duration: duration,
          isActive: false,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving voice call leave:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
