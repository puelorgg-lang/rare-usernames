import { NextRequest } from "next/server"

export const dynamic = 'force-dynamic'

const clients = new Set<ReadableStreamDefaultController>()

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)
      
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(`data: {"type":"connected"}\n\n`))
      
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
          clients.delete(controller)
        }
      }, 15000)
      
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        clients.delete(controller)
      })
    },
    cancel() {
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
