"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MessageCircle, X, Send, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"

export function FloatingChat() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: "Olá, seja bem-vindo ao users4u! Clique no botão abaixo para falar com nosso suporte.", isBot: true }
  ])
  const [inputValue, setInputValue] = useState("")
  const [showSupportButton, setShowSupportButton] = useState(true)
  const [supportRequested, setSupportRequested] = useState(false)
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null)

  // Poll for messages when ticket is created
  useEffect(() => {
    if (!currentTicketId) return
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/support/messages?ticketId=${currentTicketId}`)
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          // Convert API messages to display format
          const newMessages = data.messages.map((m: any) => ({
            text: m.message,
            isBot: m.sender !== "USER",
            senderName: m.senderName
          }))
          
          // Update messages - keep user messages and add new ones
          setMessages(prev => {
            // Get user messages from previous state
            const userMessages = prev.filter(p => !p.isBot)
            // Get bot/support messages from API
            const apiMessages = newMessages.filter((m: any) => !m.isBot || !prev.some(p => p.text === m.text && p.isBot))
            // Combine and remove duplicates
            const combined = [...userMessages, ...newMessages]
            // Remove duplicates based on text
            const unique = combined.filter((msg, index, self) => 
              index === self.findIndex((m) => m.text === msg.text)
            )
            return unique
          })
        }
      } catch (e) {}
    }, 3000)
    
    return () => clearInterval(interval)
  }, [currentTicketId])

  const handleSend = async () => {
    if (!inputValue.trim()) return
    
    // Add user message
    const userMessage = inputValue
    setMessages(prev => [...prev, { text: userMessage, isBot: false }])
    setInputValue("")
    
    // Send to API if ticket exists
    if (currentTicketId) {
      try {
        await fetch("/api/support/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId: currentTicketId,
            sender: "USER",
            senderName: session?.user?.name || "Usuário",
            message: userMessage
          })
        })
      } catch (e) {}
    } else {
      // Simulate bot response after a delay
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "Recebemos sua mensagem! Clique no botão de suporte para criar um ticket.", 
          isBot: true 
        }])
      }, 1000)
    }
  }

  const handleOpenSupport = async () => {
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.email || "unknown",
          userName: session?.user?.name || "Usuário",
          userEmail: session?.user?.email
        })
      })
      const data = await res.json()
      
      if (data.ticket) {
        setCurrentTicketId(data.ticket.id)
        setSupportRequested(true)
        setMessages(prev => [...prev, { 
          text: "Seu ticket de suporte foi criado! Um de nossos suportes ira atende-lo em breve.", 
          isBot: true 
        }])
        setShowSupportButton(false)
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-black border border-white/20 rounded-lg overflow-hidden flex flex-col shadow-lg">
          {/* Header */}
          <div className="bg-primary p-3 flex items-center gap-2">
            <Image 
              src="/dogusericon.png" 
              alt="Support" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
            <span className="font-semibold text-black">Suporte Users4U</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="ml-auto text-black hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    msg.isBot 
                      ? 'bg-white/10 text-white' 
                      : 'bg-primary text-black'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Support Button */}
            {showSupportButton && (
              <div className="flex justify-start">
                <Button 
                  onClick={handleOpenSupport}
                  className="bg-primary text-black hover:bg-primary/90 flex items-center gap-2"
                  disabled={supportRequested}
                >
                  <Headphones className="w-4 h-4" />
                  {supportRequested ? "Ticket Criado!" : "Abrir Suporte"}
                </Button>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="p-2 border-t border-white/10 flex gap-2">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button onClick={handleSend} size="icon" className="bg-primary text-black hover:bg-primary/90">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <MessageCircle className="w-6 h-6 text-black" />
        )}
      </button>
    </div>
  )
}
