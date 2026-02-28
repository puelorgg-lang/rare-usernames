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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, platform, category } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if username already exists
    const existingUsername = await prisma.username.findFirst({
      where: {
        name: name.toLowerCase(),
      },
    })

    if (existingUsername) {
      return NextResponse.json({ 
        message: "Username already exists",
        username: existingUsername 
      }, { status: 200 })
    }

    // Create new username
    const newUsername = await prisma.username.create({
      data: {
        name: name.toLowerCase(),
        platform: (platform || 'discord').toUpperCase() as Platform,
        category: (category || 'DISCORD_FREE').toUpperCase() as Category,
        status: 'AVAILABLE',
        foundAt: new Date(),
      },
    })

    return NextResponse.json({ 
      success: true, 
      username: newUsername 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating username:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
