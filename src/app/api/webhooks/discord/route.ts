import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

interface DiscordWebhookMessage {
  type: number
  content: string
  channel_id: string
  guild_id?: string
  status?: string
  available_date?: string | null
  author?: {
    id: string
    username: string
    avatar?: string
    discriminator?: string
  }
  attachments?: Array<{
    id: string
    filename: string
    url: string
  }>
  embeds?: Array<{
    title?: string
    description?: string
    fields?: Array<{
      name: string
      value: string
      inline?: boolean
    }>
  }>
}

// Fallback channel category map (for backwards compatibility)
const FALLBACK_CHANNEL_CATEGORY_MAP: Record<string, string> = {
  '1420065854401413231': 'CHARS_4',   // 4char
  '1420065865029652652': 'CHARS_3',   // 3chars
  '1420065875880316968': 'CHARS_2',   // 2chars
  '1420065886928244756': 'PT_BR',     // pt-br
  '1420065898370175038': 'EN_US',     // en-us
  '1420065909611036863': 'RANDOM',    // random
}

// Get category from database or fallback map
async function getCategoryFromChannelId(channelId: string): Promise<string> {
  try {
    // Try to find in database
    const webhook = await prisma.webhook.findUnique({
      where: { channelId }
    })
    
    if (webhook && webhook.isActive) {
      return webhook.category
    }
  } catch (error) {
    console.error("Error fetching webhook from DB:", error)
  }
  
  // Fallback to hardcoded map
  if (FALLBACK_CHANNEL_CATEGORY_MAP[channelId]) {
    return FALLBACK_CHANNEL_CATEGORY_MAP[channelId]
  }
  
  return "RANDOM"
}

// Get platform from database
async function getPlatformFromChannelId(channelId: string): Promise<string> {
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { channelId }
    })
    
    if (webhook && webhook.isActive) {
      return webhook.platform
    }
  } catch (error) {
    console.error("Error fetching webhook from DB:", error)
  }
  
  return "discord"
}

// Get category from query parameter (alternative approach)
function getCategoryFromQuery(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const category = urlObj.searchParams.get("category")
    if (category && ["CHARS_2", "CHARS_3", "CHARS_4", "PT_BR", "EN_US", "RANDOM"].includes(category.toUpperCase())) {
      return category.toUpperCase()
    }
  } catch {
    // Ignore URL parsing errors
  }
  return null
}

// Verify webhook authenticity (optional - for security)
// Discord webhooks don't use the same signing mechanism as Slack

export async function POST(req: NextRequest) {
  try {
    const body: DiscordWebhookMessage = await req.json()
    
    // Discord sends a ping message (type: 0 with content: "")
    if (body.type === 0 && !body.content && !body.embeds) {
      return NextResponse.json({ type: 2 }) // PONG for Discord
    }

    let usernames: Array<{
      name: string
      platform: string
      category: string
      status: string
      availableDate?: string | null
    }> = []

    // Get the channel ID from the message
    const channelId = body.channel_id
    const status = body.status || 'AVAILABLE'
    const availableDate = body.available_date || null

    // Try to get category from query parameter first
    // This allows you to create separate webhooks for different categories
    // Example: /api/webhooks/discord?category=CHARS_2
    const categoryFromQuery = getCategoryFromQuery(req.url)
    const dbCategory = await getCategoryFromChannelId(channelId)
    const category = categoryFromQuery || dbCategory
    const platform = await getPlatformFromChannelId(channelId)

    // Extract usernames from message content
    if (body.content) {
      // Split by newlines and extract usernames
      // Expected format: one username per line
      const lines = body.content.split(/\r?\n/).filter(line => line.trim())
      
      for (const line of lines) {
        // Clean up the username (remove mentions, special chars)
        const username = line.trim().replace(/[<@!&>]/g, "").trim()
        
        if (username && username.length >= 2 && username.length <= 32) {
          // Basic username validation (allow letters, numbers, underscores, and periods)
          if (/^[a-zA-Z0-9_.]+$/.test(username)) {
            usernames.push({
              name: username.toLowerCase(),
              platform,
              category,
              status,
              availableDate,
            })
          }
        }
      }
    }

    // Extract usernames from embeds (if any)
    if (body.embeds) {
      for (const embed of body.embeds) {
        // Check description
        if (embed.description) {
          const lines = embed.description.split(/\r?\n/).filter(line => line.trim())
          for (const line of lines) {
            const username = line.trim().replace(/[<@!&>]/g, "").trim()
            if (username && username.length >= 2 && username.length <= 32) {
              if (/^[a-zA-Z0-9_]+$/.test(username)) {
                usernames.push({
                  name: username.toLowerCase(),
                  platform,
                  category,
                  status: "AVAILABLE"
                })
              }
            }
          }
        }
        
        // Check fields
        if (embed.fields) {
          for (const field of embed.fields) {
            const lines = field.value.split(/\r?\n/).filter(line => line.trim())
            for (const line of lines) {
              const username = line.trim().replace(/[<@!&>]/g, "").trim()
              if (username && username.length >= 2 && username.length <= 32) {
                if (/^[a-zA-Z0-9_]+$/.test(username)) {
                  usernames.push({
                    name: username.toLowerCase(),
                    platform,
                    category,
                    status: "AVAILABLE"
                  })
                }
              }
            }
          }
        }
      }
    }

    // Check for duplicate entries before saving
    const uniqueUsernames = usernames.filter((username, index, self) =>
      index === self.findIndex(u => u.name === username.name && u.platform === username.platform)
    )

    if (uniqueUsernames.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No valid usernames found in message",
        count: 0
      })
    }

    // Save to database
    const savedUsernames = []
    for (const username of uniqueUsernames) {
      try {
        const saved = await prisma.username.upsert({
          where: {
            name_platform: {
              name: username.name,
              platform: username.platform
            }
          },
          update: {
            status: username.status,
            category: username.category,
            availableDate: username.availableDate ? new Date(username.availableDate) : null,
            foundAt: new Date()
          },
          create: {
            name: username.name,
            platform: username.platform,
            category: username.category,
            status: username.status,
            availableDate: username.availableDate ? new Date(username.availableDate) : null,
          }
        })
        savedUsernames.push(saved)
      } catch (error) {
        console.error("Error saving username:", username.name, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${savedUsernames.length} usernames`,
      count: savedUsernames.length,
      usernames: savedUsernames.map(u => u.name)
    })

  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Discord webhook endpoint is running",
    usage: "Configure a Discord Webhook to point to this URL"
  })
}
