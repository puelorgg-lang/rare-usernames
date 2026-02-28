"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface PricingCardProps {
  title: string
  price: string
  period: string
  features: string[]
  popular?: boolean
  buttonText: string
}

export function PricingCard({ title, price, period, features, popular, buttonText }: PricingCardProps) {
  const handleClick = () => {
    window.open('https://discord.gg/x7d5g89kNe', '_blank')
  }

  return (
    <Card className={`relative flex flex-col p-8 glass-card transition-all duration-300 ${popular ? 'border-primary/50 bg-primary/[0.03] shadow-[0_0_60px_-15px_rgba(255,255,255,0.2)] scale-105 z-10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
           <Badge className="bg-primary hover:bg-primary text-black border-0 px-4 py-1.5 text-sm shadow-lg shadow-white/40">Mais Popular</Badge>
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-5xl font-bold text-white tracking-tight">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
      </div>
      <div className="flex-1 mb-8">
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm font-medium">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${popular ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button 
        onClick={handleClick}
        className={`w-full h-14 rounded-xl text-base font-bold transition-all duration-300 ${popular ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
          {buttonText}
      </Button>
    </Card>
  )
}
