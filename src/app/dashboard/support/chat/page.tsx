"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, User, Clock, CheckCircle, XCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ChatTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: "OPEN" | "IN_PROGRESS" | "CLOSED"
  assignedTo: string | null
  createdAt: string
  lastMessage: string
}

export default function SupportChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<ChatTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"open" | "my_chats">("open")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    fetchTickets()
  }, [activeTab])

  const fetchTickets = async () => {
    try {
      const endpoint = activeTab === "open" 
        ? "/api/support/tickets?status=OPEN" 
        : "/api/support/tickets?status=IN_PROGRESS"
      const res = await fetch(endpoint)
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const claimTicket = async (ticketId: string) => {
    try {
      await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, action: "CLAIM" })
      })
      fetchTickets()
    } catch (error) {
      console.error("Error claiming ticket:", error)
    }
  }

  const closeTicket = async (ticketId: string) => {
    try {
      await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, action: "CLOSE" })
      })
      fetchTickets()
    } catch (error) {
      console.error("Error closing ticket:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Chat de Suporte</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie os chats de suporte com os usuários.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "open" ? "default" : "outline"}
          onClick={() => setActiveTab("open")}
          className={activeTab === "open" ? "bg-primary text-black" : ""}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chats Abertos
        </Button>
        <Button
          variant={activeTab === "my_chats" ? "default" : "outline"}
          onClick={() => setActiveTab("my_chats")}
          className={activeTab === "my_chats" ? "bg-primary text-black" : ""}
        >
          <User className="w-4 h-4 mr-2" />
          Meus Chats
        </Button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card className="glass-card border-white/5">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Nenhum chat {activeTab === "open" ? "aberto" : "em andamento"} no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          tickets.map(ticket => (
            <Card key={ticket.id} className="glass-card border-white/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {ticket.userName || ticket.userEmail}
                  </CardTitle>
                  <Badge variant={ticket.status === "OPEN" ? "default" : "secondary"}>
                    {ticket.status === "OPEN" ? "Aberto" : ticket.status === "IN_PROGRESS" ? "Em Andamento" : "Fechado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{ticket.lastMessage}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleString("pt-BR")}
                    </div>
                    {ticket.status === "OPEN" ? (
                      <Button 
                        size="sm" 
                        onClick={() => claimTicket(ticket.id)}
                        className="bg-primary text-black hover:bg-primary/90"
                      >
                        Resgatar Chat
                      </Button>
                    ) : ticket.status === "IN_PROGRESS" && ticket.assignedTo === session?.user?.email ? (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => closeTicket(ticket.id)}
                      >
                        Fechar Chat
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
