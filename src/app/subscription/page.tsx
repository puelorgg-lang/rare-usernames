"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Shield } from "lucide-react"
import { upgradeSubscription } from "@/actions/subscription"
import { useTransition } from "react"
import Link from "next/link"

export default function SubscriptionPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur p-4">
        <div className="container flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-[#5865F2]" />
            <span>RareNames</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 container py-20 flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Unlock access to thousands of rare usernames instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
          <PlanCard 
            title="Daily Pass" 
            price="$5" 
            period="/day" 
            plan="DAILY"
            features={["24h Access", "All Categories"]} 
          />
          <PlanCard 
            title="Weekly Pass" 
            price="$15" 
            period="/week" 
            plan="WEEKLY"
            popular
            features={["7 Days Access", "All Categories", "Priority Support"]} 
          />
          <PlanCard 
            title="Monthly Pro" 
            price="$40" 
            period="/month" 
            plan="MONTHLY"
            features={["30 Days Access", "All Categories", "VIP Support"]} 
          />
        </div>
      </main>
    </div>
  )
}

function PlanCard({ title, price, period, features, popular, plan }: { title: string, price: string, period: string, features: string[], popular?: boolean, plan: "DAILY" | "WEEKLY" | "MONTHLY" }) {
  const [isPending, startTransition] = useTransition()

  const handleSubscribe = () => {
    startTransition(async () => {
      await upgradeSubscription(plan)
    })
  }

  return (
    <Card className={`relative flex flex-col ${popular ? 'border-[#5865F2] shadow-lg shadow-[#5865F2]/20 scale-105 z-10' : 'border-muted'}`}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${popular ? 'bg-[#5865F2] hover:bg-[#4752C4]' : ''}`} 
          variant={popular ? 'default' : 'outline'}
          onClick={handleSubscribe}
          disabled={isPending}
        >
          {isPending ? "Processing..." : "Subscribe Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}
