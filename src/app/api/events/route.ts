import { NextRequest } from "next/server"

// Force dynamic rendering for SSE endpoint
export const dynamic = 'force-dynamic'

// Store active connections
const clients = new Set<ReadableStreamDefaultController>()

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)
      
      // Send initial connection message
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(`data: {"type":"connected"}\n\n`))
      
      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
          clients.delete(controller)
        }
      }, 15000)
      
      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        clients.delete(controller)
      })
    },
    cancel() {
      // Client disconnected
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Function to notify all clients of new data
function notifyNewUsername() {
  const encoder = new TextEncoder()
  const data = JSON.stringify({ 
    type: 'new_username', 
    timestamp: Date.now() 
  })
  
  clients.forEach((client) => {
    try {
      client.enqueue(encoder.encode(`data: ${data}\n\n`))
    } catch {
      clients.delete(client)
    }
  })
}
