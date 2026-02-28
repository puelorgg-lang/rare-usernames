import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Client, GatewayIntentBits, ChannelType, AnyThreadChannel, Message } from "discord.js"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action")

  try {
    if (action === "sources") {
      // Get all Discord sources
      const sources = await prisma.discordSource.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({ sources })
    }

    if (action === "scan") {
      // Scan all active sources
      const sources = await prisma.discordSource.findMany({
        where: { isActive: true }
      })

      const allUsernames: any[] = []

      for (const source of sources) {
        try {
          // Create a new Discord client
          const client = new Client({
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildMessages
            ]
          })

          await client.login(process.env.DISCORD_BOT_TOKEN)

          // Get the channel
          const channel = await client.channels.fetch(source.channelId)
          
          if (channel && channel.type === ChannelType.GuildForum) {
            // Fetch threads from forum
            const threads = await channel.threads.fetch()
            const threadsArray = Array.from(threads.threads.values())
            
            for (const thread of threadsArray) {
              if (thread && thread.id === source.threadId) {
                // Fetch messages from this thread
                const messages = await thread.messages.fetch({ limit: 10 })
                const messagesArray = Array.from(messages.values())
                
                for (const message of messagesArray) {
                  // Parse embed content
                  if (message.embeds.length > 0) {
                    const embed = message.embeds[0]
                    const description = embed.description || ""
                    
                    // Extract username from format:
                    // Discord Username
                    // ```2pbn```
                    // Void Usernames
                    
                    const usernameMatch = description.match(/```([a-zA-Z0-9_]+)```/)
                    if (usernameMatch) {
                      const username = usernameMatch[1].toLowerCase()
                      
                      allUsernames.push({
                        name: username,
                        platform: "discord",
                        category: source.category,
                        foundAt: message.createdAt,
                        sourceId: source.id
                      })
                    }
                  }
                }
              }
            }
          } else if (channel && channel.type === ChannelType.GuildText) {
            // Regular text channel
            const messages = await channel.messages.fetch({ limit: 10 })
            const messagesArray = Array.from(messages.values())
            
            for (const message of messagesArray) {
              if (message.embeds.length > 0) {
                const embed = message.embeds[0]
                const description = embed.description || ""
                
                const usernameMatch = description.match(/```([a-zA-Z0-9_]+)```/)
                if (usernameMatch) {
                  const username = usernameMatch[1].toLowerCase()
                  
                  allUsernames.push({
                    name: username,
                    platform: "discord",
                    category: source.category,
                    foundAt: message.createdAt,
                    sourceId: source.id
                  })
                }
              }
            }
          }

          client.destroy()
        } catch (error) {
          console.error(`Error scanning source ${source.name}:`, error)
        }
      }

      // Save usernames to database
      for (const username of allUsernames) {
        await prisma.username.upsert({
          where: {
            name_platform: {
              name: username.name,
              platform: username.platform
            }
          },
          update: {
            foundAt: username.foundAt,
            category: username.category,
            status: "AVAILABLE"
          },
          create: {
            name: username.name,
            platform: username.platform,
            category: username.category,
            status: "AVAILABLE",
            foundAt: username.foundAt
          }
        })
      }

      return NextResponse.json({ 
        success: true, 
        scanned: allUsernames.length,
        usernames: allUsernames 
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in Discord sources API:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, serverId, channelId, threadId, category } = body

    const source = await prisma.discordSource.create({
      data: {
        name,
        serverId,
        channelId,
        threadId: threadId || null,
        category: category || "DISCORD_FREE",
        isActive: true
      }
    })

    return NextResponse.json({ success: true, source })
  } catch (error) {
    console.error("Error creating Discord source:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const sourceId = searchParams.get("id")

    if (!sourceId) {
      return NextResponse.json({ error: "Source ID required" }, { status: 400 })
    }

    await prisma.discordSource.delete({
      where: { id: sourceId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting Discord source:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
