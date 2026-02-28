"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, User, Clock, CheckCircle, XCircle, Send, Bell, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  ticketId: string
  sender: "USER" | "SUPPORT"
  senderName: string
  message: string
  createdAt: string
}

interface ChatTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: "OPEN" | "IN_PROGRESS" | "CLOSED"
  assignedTo: string | null
  assignedToName: string | null
  userTyping: boolean
  supportTyping: boolean
  createdAt: string
}

export default function SupportChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<ChatTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"open" | "my_chats">("open")
  const [selectedTicket, setSelectedTicket] = useState<ChatTicket | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [newTicketNotification, setNewTicketNotification] = useState<ChatTicket | null>(null)
  const [userIsTyping, setUserIsTyping] = useState(false)
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null)
  let typingTimeout: NodeJS.Timeout

  // Play notification sound
  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(() => {})
    }
  }

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch tickets when tab changes
  useEffect(() => {
    fetchTickets()
  }, [activeTab])

  // Only poll for new tickets when on open tab
  useEffect(() => {
    if (activeTab !== "open") return
    
    const interval = setInterval(() => {
      fetchTickets()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [activeTab])

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id)
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => fetchMessages(selectedTicket.id), 3000)
      return () => clearInterval(interval)
    }
  }, [selectedTicket])

  const fetchTickets = async () => {
    try {
      const endpoint = activeTab === "open" 
        ? "/api/support/tickets?status=OPEN" 
        : "/api/support/tickets?status=IN_PROGRESS"
      const res = await fetch(endpoint)
      const data = await res.json()
      const newTickets = data.tickets || []
      
      // Check for new tickets only when on open tab
      if (activeTab === "open") {
        const currentTicketIds = tickets.map(t => t.id)
        const newestTicket = newTickets.find((t: ChatTicket) => !currentTicketIds.includes(t.id))
        
        if (newestTicket) {
          setNewTicketNotification(newestTicket)
          playNotificationSound()
          
          // Show browser notification if permitted
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Novo Chat de Suporte!", {
              body: `${newestTicket.userName} está aguardando atendimento`,
              icon: "/dogusericon.png"
            })
          }
          
          toast({
            title: "Novo chat de suporte!",
            description: `${newestTicket.userName} está aguardando atendimento`,
            variant: "default",
          })
        }
      }
      
      // Don't update if tickets haven't changed (prevent flickering)
      const hasChanged = JSON.stringify(newTickets) !== JSON.stringify(tickets)
      if (hasChanged) {
        setTickets(newTickets)
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (ticketId: string) => {
    try {
      setMessagesLoading(true)
      const res = await fetch(`/api/support/messages?ticketId=${ticketId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const claimTicket = async (ticketId: string) => {
    try {
      const res = await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, action: "CLAIM" })
      })
      const data = await res.json()
      
      // Send automatic message to user
      if (data.ticket) {
        const supportName = session?.user?.name || "Suporte"
        await fetch("/api/support/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId,
            sender: "SUPPORT",
            senderName: supportName,
            message: `${supportName} Atendeu seu chat, aguarde...`
          })
        })
        
        setSelectedTicket(data.ticket)
      }
      
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
      setSelectedTicket(null)
      fetchTickets()
    } catch (error) {
      console.error("Error closing ticket:", error)
    }
  }

  const declineTicket = async (ticketId: string) => {
    try {
      await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, action: "CLOSE" })
      })
      setNewTicketNotification(null)
      fetchTickets()
    } catch (error) {
      console.error("Error declining ticket:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return

    try {
      await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          sender: "SUPPORT",
          senderName: session?.user?.name || "Suporte",
          message: newMessage
        })
      })
      setNewMessage("")
      // Stop typing indicator
      setUserIsTyping(false)
      fetchMessages(selectedTicket.id)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleTyping = (isTyping: boolean) => {
    if (!selectedTicket) return
    
    setUserIsTyping(isTyping)
    
    // Send typing status to API
    fetch("/api/support/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId: selectedTicket.id,
        action: "TYPING",
        isTyping,
        sender: "SUPPORT"
      })
    }).catch(() => {})
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="space-y-8">
      {/* Notification Sound */}
      <audio ref={notificationSoundRef} preload="auto">
        <source src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" type="audio/mpeg" />
      </audio>
      
      {/* New Ticket Notification Popup */}
      {newTicketNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="glass-card border-primary w-96 animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Bell className="w-5 h-5 animate-bounce" />
                  Novo Chat de Suporte!
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setNewTicketNotification(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="font-medium text-lg">{newTicketNotification.userName}</p>
                <p className="text-muted-foreground text-sm">{newTicketNotification.userEmail}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={async () => {
                    // First claim the ticket
                    const res = await fetch("/api/support/tickets", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ticketId: newTicketNotification.id, action: "CLAIM" })
                    })
                    const data = await res.json()
                    
                    // Send automatic message to user
                    if (data.ticket) {
                      const supportName = session?.user?.name || "Suporte"
                      await fetch("/api/support/messages", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ticketId: newTicketNotification.id,
                          sender: "SUPPORT",
                          senderName: supportName,
                          message: `${supportName} Atendeu seu chat, aguarde...`
                        })
                      })
                    }
                    
                    setNewTicketNotification(null)
                    setActiveTab("my_chats")
                    fetchTickets()
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceitar
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => declineTicket(newTicketNotification.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Recusar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Chat de Suporte</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie os chats de suporte com os usuários.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "open" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("open")
                setNewTicketNotification(null)
              }}
              className={activeTab === "open" ? "bg-primary text-black" : ""}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chats Abertos
              {newTicketNotification && activeTab !== "open" && (
                <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-pulse">
                  !
                </span>
              )}
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

          {/* Tickets */}
          <div className="space-y-3">
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
                <Card 
                  key={ticket.id} 
                  className={`glass-card border-white/5 cursor-pointer hover:border-primary ${selectedTicket?.id === ticket.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {ticket.userName}
                      </CardTitle>
                      <Badge variant={ticket.status === "OPEN" ? "default" : "secondary"}>
                        {ticket.status === "OPEN" ? "Aberto" : "Em Andamento"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleString("pt-BR")}
                      </div>
                      {ticket.status === "OPEN" ? (
                        <Button 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); claimTicket(ticket.id); }}
                          className="bg-primary text-black hover:bg-primary/90"
                        >
                          Resgatar
                        </Button>
                      ) : ticket.assignedTo === session?.user?.email ? (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => { e.stopPropagation(); closeTicket(ticket.id); }}
                        >
                          Fechar
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Atendendo: {ticket.assignedToName || ticket.assignedTo}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="space-y-4">
          {selectedTicket ? (
            <>
              <Card className="glass-card border-white/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedTicket.userName}
                    </CardTitle>
                    {selectedTicket.assignedTo && (
                      <span className="text-sm text-muted-foreground">
                        Atendido por: {selectedTicket.assignedToName || selectedTicket.assignedTo}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="h-80 overflow-y-auto space-y-3">
                  {messagesLoading ? (
                    <p className="text-muted-foreground text-center">Carregando mensagens...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-muted-foreground text-center">Nenhuma mensagem ainda.</p>
                  ) : (
                    messages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === "SUPPORT" ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] p-2 rounded-lg text-sm ${
                            msg.sender === "SUPPORT" 
                              ? 'bg-primary text-black' 
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <span className="text-xs opacity-70 block">{msg.senderName}</span>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                  {/* Typing indicator */}
                  {selectedTicket.userTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-white rounded-lg px-4 py-2">
                        <span className="text-sm text-muted-foreground">{selectedTicket.userName} está digitando...</span>
                        <span className="inline-flex ml-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
                {selectedTicket.status !== "CLOSED" && (
                  <div className="p-3 border-t border-white/10 flex gap-2">
                    <Input 
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        // Send typing status
                        handleTyping(e.target.value.length > 0)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleTyping(false)
                          sendMessage()
                        }
                      }}
                      onBlur={() => handleTyping(false)}
                      placeholder="Digite sua mensagem..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Button onClick={() => {
                      handleTyping(false)
                      sendMessage()
                    }} className="bg-primary text-black hover:bg-primary/90">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="glass-card border-white/5">
              <CardContent className="p-6 h-80 flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Selecione um chat para começar a atender.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
