import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// In-memory store for demo (replace with database in production)
let tickets: any[] = []

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  try {
    let filteredTickets = tickets
    
    if (status) {
      if (status === "OPEN") {
        filteredTickets = tickets.filter(t => t.status === "OPEN")
      } else if (status === "IN_PROGRESS") {
        // Show tickets assigned to this support
        filteredTickets = tickets.filter(t => 
          t.status === "IN_PROGRESS" && t.assignedTo === session.user.email
        )
      }
    }

    return NextResponse.json({ tickets: filteredTickets })
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { ticketId, action } = body

    const ticketIndex = tickets.findIndex(t => t.id === ticketId)
    if (ticketIndex === -1) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (action === "CLAIM") {
      tickets[ticketIndex].status = "IN_PROGRESS"
      tickets[ticketIndex].assignedTo = session.user.email
    } else if (action === "CLOSE") {
      tickets[ticketIndex].status = "CLOSED"
    }

    return NextResponse.json({ success: true, ticket: tickets[ticketIndex] })
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, userName, userEmail, message } = body

    const newTicket = {
      id: Date.now().toString(),
      userId,
      userName: userName || "Usuário",
      userEmail,
      status: "OPEN",
      assignedTo: null,
      createdAt: new Date().toISOString(),
      lastMessage: message
    }

    tickets.push(newTicket)

    return NextResponse.json({ success: true, ticket: newTicket })
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
