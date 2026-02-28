
"use client"

import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

const DISCORD_INVITE = "https://discord.gg/x7d5g89kNe"

export function CheckoutButton() {
  const handleCheckout = () => {
    window.open(DISCORD_INVITE, '_blank')
  }

  return (
    <Button 
      className="w-full bg-primary hover:bg-primary/90 text-black" 
      onClick={handleCheckout}
    >
      <Zap className="mr-2 h-4 w-4" />
      Assinar Agora
    </Button>
  )
}
