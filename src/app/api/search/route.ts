import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Configuration
const CHANNEL_ID = "1474813731526545614"
const SERVER_ID = "1473338499439657074"
const SELFBOT_URL = process.env.SELFBOT_URL || "http://localhost:3001" // Selfbot URL

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const option = searchParams.get("option") || "all"

  if (!query) {
    return NextResponse.json({ error: "ID ou username é obrigatório" }, { status: 400 })
  }

  try {
    // Send request to selfbot to search for profile
    console.log('Sending search request to selfbot for:', query)
    
    const response = await fetch(`${SELFBOT_URL}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        option,
        channelId: CHANNEL_ID,
        serverId: SERVER_ID,
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout (zany bot takes time)
    })

    if (!response.ok) {
      throw new Error(`Failed to get response from selfbot: ${response.status}`)
    }

    const data = await response.json()
    console.log('Search result:', data)

    // Track search count if we have a valid userId
    if (data.userId) {
      try {
        const searchLog = await prisma.searchLog.upsert({
          where: { discordId: data.userId },
          update: {
            searchCount: { increment: 1 },
            lastSearched: new Date()
          },
          create: {
            discordId: data.userId,
            searchCount: 1,
            lastSearched: new Date()
          }
        })
        data.searchCount = searchLog.searchCount
      } catch (dbError) {
        console.error('Failed to track search:', dbError)
      }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Search error:", error.message)
    
    // If selfbot is not available, return an error
    return NextResponse.json({ 
      error: "Selfbot não disponível. Verifique se o monitor está rodando." 
    }, { status: 503 })
  }
}
