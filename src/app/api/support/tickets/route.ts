import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  try {
    let whereClause: any = {}
    
    if (status === "OPEN") {
      whereClause.status = "OPEN"
    } else if (status === "IN_PROGRESS") {
      whereClause.status = "IN_PROGRESS"
      whereClause.assignedTo = session.user.email
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

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { ticketId, action } = body

    let updateData: any = {}

    if (action === "CLAIM") {
      updateData.status = "IN_PROGRESS"
      updateData.assignedTo = session.user.email
    } else if (action === "CLOSE") {
      updateData.status = "CLOSED"
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
