import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  // Allow users to see their own messages if they have a ticketId
  const { searchParams } = new URL(req.url)
  const ticketId = searchParams.get("ticketId")

  // If not logged in, require ticketId
  if (!session && !ticketId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // If not admin/support, can only view their own ticket messages
  if (session && session.user.role !== "ADMIN" && session.user.role !== "SUPPORT") {
    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID required" }, { status: 400 })
    }
    // Verify user owns the ticket
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId }
      })
      if (!ticket || (ticket.userId !== session.user.email && ticket.userEmail !== session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  } else if (!session && ticketId) {
    // Non-logged in users with ticketId - allow viewing (for floating chat)
    // This is a simplified check - in production you'd want more security
  } else if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!ticketId) {
    return NextResponse.json({ error: "Ticket ID required" }, { status: 400 })
  }

  try {
    const messages = await prisma.supportMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // Allow users without session to create messages (for floating chat)
  const session = await getServerSession(authOptions)

  try {
    const body = await req.json()
    const { ticketId, sender, senderName, message } = body

    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        sender,
        senderName,
        message
      }
    })

    // If it's a user message and there's no open ticket, create one
    if (sender === "USER") {
      const userId = session?.user?.email || "anonymous"
      const userEmail = session?.user?.email || ""
      
      await prisma.supportTicket.upsert({
        where: { id: ticketId },
        update: { status: "OPEN" },
        create: {
          id: ticketId,
          userId,
          userName: senderName,
          userEmail,
          status: "OPEN"
        }
      })
    }

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
