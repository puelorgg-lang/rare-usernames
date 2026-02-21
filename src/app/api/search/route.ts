import { NextRequest, NextResponse } from "next/server"

// Configuration
const CHANNEL_ID = "1474813731526545614"
const SERVER_ID = "1473338499439657074"
const SELFBOT_URL = "http://localhost:3001" // Selfbot runs on separate port

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const option = searchParams.get("option") || "avatar"

  if (!userId) {
    return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
  }

  try {
    // Send request to selfbot to search for profile
    const response = await fetch(`${SELFBOT_URL}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        option,
        channelId: CHANNEL_ID,
        serverId: SERVER_ID,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      throw new Error("Failed to get response from selfbot")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Search error:", error.message)
    
    // If selfbot is not available, return a demo response
    return NextResponse.json({
      userId,
      username: "Demo User",
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
      error: null,
      message: "Modo demo - Configure o selfbot para buscar dados reais",
    })
  }
}
