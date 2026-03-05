import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { discordId, bannerUrl } = await request.json()

    if (!discordId || !bannerUrl) {
      return NextResponse.json({ error: "discordId e bannerUrl são obrigatórios" }, { status: 400 })
    }

    // Check if this banner already exists for this user
    const existing = await prisma.bannerHistory.findFirst({
      where: {
        discordId,
        bannerUrl,
      },
    })

    if (!existing) {
      // Save new banner
      await prisma.bannerHistory.create({
        data: {
          discordId,
          bannerUrl,
          changedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving banner:", error)
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
    const banners = await prisma.bannerHistory.findMany({
      where: { discordId },
      orderBy: { changedAt: "desc" },
    })

    return NextResponse.json(banners, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
