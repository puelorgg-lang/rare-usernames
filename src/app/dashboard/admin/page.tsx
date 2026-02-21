
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Activity, Play, Settings, Webhook } from "lucide-react"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ScannerButton } from "@/components/dashboard/scanner-button"

// Força atualização a cada requisição
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const userCount = await prisma.user.count()
  const usernameCount = await prisma.username.count()
  
  // Mock data for revenue
  const revenue = 1250.00

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text text-red-500">Admin</h2>
        <p className="text-muted-foreground mt-2">
          Controle total da plataforma.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              +20% desde o último mês
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usernames Rastreados
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usernameCount}</div>
            <p className="text-xs text-muted-foreground">
              +12 novos hoje
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +15% desde o último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Ações Rápidas</h3>
        <div className="flex gap-4">
          <ScannerButton />
          
          <Link href="/dashboard/admin/users">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <Users className="mr-2 h-4 w-4" /> Gerenciar Usuários
            </Button>
          </Link>

          <Link href="/dashboard/admin/webhooks">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <Webhook className="mr-2 h-4 w-4" /> Webhooks Discord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
