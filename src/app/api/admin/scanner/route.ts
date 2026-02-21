
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { runScanner } from "@/lib/scanner"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  // Protect route - Admin only
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { count } = await req.json().catch(() => ({ count: 5 }))
    const foundUsernames = await runScanner(count || 5)
    
    return NextResponse.json({ 
      success: true, 
      message: `Scanner finished. Found ${foundUsernames.length} available usernames.`,
      data: foundUsernames 
    })
  } catch (error) {
    console.error("Scanner error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
