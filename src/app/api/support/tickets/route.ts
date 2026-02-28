import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const ticketId = searchParams.get("id")

  try {
    // If getting a specific ticket (for typing status) - no auth needed
    if (status === "BY_ID" && ticketId) {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId }
      })
      return NextResponse.json({ tickets: ticket ? [ticket] : [] })
    }

    // For other queries, require admin/support role
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let whereClause: any = {}
    
    if (status === "OPEN") {
      whereClause.status = "OPEN"
    } else if (status === "IN_PROGRESS") {
      whereClause.status = "IN_PROGRESS"
      whereClause.assignedTo = session.user.email
    } else if (status === "ALL_PROGRESS" && session.user.role === "ADMIN") {
      // Admin can see all in-progress tickets
      whereClause.status = "IN_PROGRESS"
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)

  // Allow typing updates without full authentication
  const body = await req.json()
  const { action } = body
  
  if (action === "TYPING") {
    // Typing updates can be done by anyone with a ticketId
    try {
      const { ticketId, isTyping, sender } = body
      let updateData: any = {}
      
      if (sender === "SUPPORT") {
        updateData.supportTyping = isTyping
      } else {
        updateData.userTyping = isTyping
      }

      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: updateData
      })

      return NextResponse.json({ success: true, ticket })
    } catch (error) {
      console.error("Error updating typing status:", error)
      return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
  }

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { ticketId, isTyping } = body

    let updateData: any = {}

    if (action === "CLAIM") {
      updateData.status = "IN_PROGRESS"
      updateData.assignedTo = session.user.email
      updateData.assignedToName = session.user.name || session.user.email
    } else if (action === "CLOSE") {
      updateData.status = "CLOSED"
    } else if (action === "TYPING") {
      // Update typing status
      if (session.user.role === "ADMIN" || session.user.role === "SUPPORT") {
        updateData.supportTyping = isTyping
      } else {
        updateData.userTyping = isTyping
      }
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData
    })

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, userName, userEmail } = body

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        userName,
        userEmail,
        status: "OPEN"
      }
    })

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
