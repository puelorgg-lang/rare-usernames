import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const webhooks = await prisma.webhook.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(webhooks)
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // For now, allow all requests - in production, add proper admin check
    // if (!session || session.user?.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await req.json()
    const { channelId, platform, category, webhookUrl, serverId } = body

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      )
    }

    const webhook = await prisma.webhook.upsert({
      where: { channelId },
      update: {
        platform: platform || "discord",
        category: category || "RANDOM",
        webhookUrl: webhookUrl || null,
        serverId: serverId || null,
        isActive: true,
      },
      create: {
        channelId,
        platform: platform || "discord",
        category: category || "RANDOM",
        webhookUrl: webhookUrl || null,
        serverId: serverId || null,
        isActive: true,
      }
    })

    return NextResponse.json(webhook)
  } catch (error) {
    console.error("Error creating/updating webhook:", error)
    return NextResponse.json(
      { error: "Failed to create/update webhook" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get("channelId")

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      )
    }

    await prisma.webhook.delete({
      where: { channelId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting webhook:", error)
    return NextResponse.json(
      { error: "Failed to delete webhook" },
      { status: 500 }
    )
  }
}
