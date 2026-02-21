
"use client"

import { Button } from "@/components/ui/button"
import { Zap, Loader2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "pro_hunter" }),
      })
      
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.error === "Stripe key not configured") {
        toast({ 
          title: "Modo de Demonstração", 
          description: "Pagamentos ainda não configurados no servidor.", 
          variant: "destructive" 
        })
      } else {
        throw new Error("Failed to start checkout")
      }
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível iniciar o checkout.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      className="w-full bg-primary hover:bg-primary/90 text-white" 
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
      Assinar Agora
    </Button>
  )
}
