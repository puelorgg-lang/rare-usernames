"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AutoRefresh() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const doRefresh = useCallback(() => {
    setIsRefreshing(true)
    // Use router.refresh() to refresh server components without losing client state (like login)
    router.refresh()
    setLastUpdate(new Date())
    setTimeout(() => setIsRefreshing(false), 500)
  }, [router])

  // Listen for Server-Sent Events for instant updates
  useEffect(() => {
    let eventSource: EventSource | null = null
    
    const connect = () => {
      eventSource = new EventSource('/api/notify')
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_username') {
            console.log('🔔 Novo username detectado! Atualizando...')
            doRefresh()
          }
        } catch {
          // Ignore non-JSON messages (like heartbeats)
        }
      }
      
      eventSource.onerror = () => {
        eventSource?.close()
        // Reconnect after 5 seconds
        setTimeout(connect, 5000)
      }
    }
    
    connect()
    
    // Fallback: also check every 30 seconds even if SSE fails
    const interval = setInterval(doRefresh, 30000)
    
    return () => {
      eventSource?.close()
      clearInterval(interval)
    }
  }, [doRefresh])

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {lastUpdate.toLocaleTimeString()}
      </span>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={doRefresh}
        className="h-8 w-8"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}
