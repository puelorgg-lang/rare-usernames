
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutButton } from "@/components/dashboard/checkout-button"
import { Button } from "@/components/ui/button"
import { Check, Zap } from "lucide-react"

export default function SubscriptionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Assinatura</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie seu plano e desbloqueie recursos exclusivos.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 lg:max-w-5xl">
        {/* Iniciante Plan */}
        <Card className="glass-card border-white/5 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">Iniciante</CardTitle>
            <CardDescription>Para quem quer testar o serviço.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">R$ 5<span className="text-lg text-muted-foreground font-normal">/dia</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 20 Verificações por dia</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Acesso a categorias básicas</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Suporte comunitário</li>
            </ul>
          </CardContent>
          <CardFooter>
            <CheckoutButton />
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="glass-card border-primary/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 z-[-1]"></div>
          <div className="absolute top-0 right-0 p-2">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">POPULAR</span>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl glow-text">Pro</CardTitle>
            <CardDescription>Para caçadores de usernames.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">R$ 16<span className="text-lg text-muted-foreground font-normal">/semana</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 100 Verificações por dia</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Acesso a categorias intermédiarias</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Alertas em tempo real</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Suporte prioritário</li>
            </ul>
          </CardContent>
          <CardFooter>
            <CheckoutButton />
          </CardFooter>
        </Card>

        {/* Elite Plan */}
        <Card className="glass-card border-white/5 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">Elite</CardTitle>
            <CardDescription>Para caçadores sérios de usernames raros.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">R$ 25<span className="text-lg text-muted-foreground font-normal">/mês</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Verificações Ilimitadas</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Acesso a TODAS categorias (2 chars, etc)</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Alertas em tempo real</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Suporte Prioritário</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Acesso antecipado a drops</li>
            </ul>
          </CardContent>
          <CardFooter>
            <CheckoutButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
