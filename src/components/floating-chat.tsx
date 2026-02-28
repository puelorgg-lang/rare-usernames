"use client"

import { useState } from "react"
import Image from "next/image"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: "Olá, seja bem-vindo ao users4u, aguarde enquanto estamos colocando você em contato com um de nossos suportes", isBot: true }
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (!inputValue.trim()) return
    
    // Add user message
    setMessages(prev => [...prev, { text: inputValue, isBot: false }])
    setInputValue("")
    
    // Simulate bot response after a delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Recebemos sua mensagem! Um de nossos suportes ira responder em breve.", 
        isBot: true 
      }])
    }, 1000)
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
          </div>
          
          {/* Input */}
          <div className="p-2 border-t border-white/10 flex gap-2">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
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
