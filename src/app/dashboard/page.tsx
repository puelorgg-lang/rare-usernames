import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Hash, Globe, Ghost, Sparkles, TrendingUp, Clock, CheckCircle2 } from "lucide-react"
import prisma from "@/lib/prisma"
import { CATEGORY_LABELS, Category } from "@/lib/constants"
import { AutoRefresh } from "@/components/dashboard/auto-refresh"

// Força atualização a cada requisição
export const dynamic = 'force-dynamic'

const categories = [
  { id: "chars_2", name: "2 Caracteres", description: "Combinações ultra raras de 2 letras.", icon: <Hash className="h-6 w-6 text-red-400" />, color: "border-red-500/20 bg-red-500/5 hover:border-red-500/50" },
  { id: "chars_3", name: "3 Caracteres", description: "Nomes de 3 letras muito procurados.", icon: <Hash className="h-6 w-6 text-orange-400" />, color: "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/50" },
  { id: "chars_4", name: "4 Caracteres", description: "Usernames limpos de 4 letras.", icon: <Hash className="h-6 w-6 text-yellow-400" />, color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50" },
  { id: "pt_br", name: "Palavras PT-BR", description: "Melhores palavras em Português.", icon: <Globe className="h-6 w-6 text-green-400" />, color: "border-green-500/20 bg-green-500/5 hover:border-green-500/50" },
  { id: "en_us", name: "Palavras EN-US", description: "Palavras premium do dicionário inglês.", icon: <Globe className="h-6 w-6 text-blue-400" />, color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50" },
  { id: "random", name: "Aleatórios", description: "Descobertas únicas e legais.", icon: <Ghost className="h-6 w-6 text-purple-400" />, color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/50" },
]

export default async function DashboardPage() {
  const latestUsernames = await prisma.username.findMany({
    where: { status: "AVAILABLE" },
    take: 4,
    orderBy: { foundAt: "desc" },
  })

  const totalAvailable = await prisma.username.count({
    where: { status: "AVAILABLE" },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight glow-text">Painel</h2>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao seu centro de comando de usernames raros.
          </p>
        </div>
        <div className="flex gap-2 items-center">
           <AutoRefresh />
           <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
               <CheckCircle2 className="mr-2 h-4 w-4" />
               {totalAvailable} Usernames Disponíveis
           </Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          Últimas Descobertas
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {latestUsernames.map((u) => (
            <div key={u.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-black/40 text-muted-foreground border border-white/5">
                  {u.platform}
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {new Date(u.foundAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-lg font-mono font-bold text-primary group-hover:glow-text transition-all">
                {u.name}
              </div>
              <div className="mt-2 text-xs text-muted-foreground truncate">
                {CATEGORY_LABELS[u.category as Category]}
              </div>
            </div>
          ))}
          {latestUsernames.length === 0 && (
             <div className="col-span-full p-8 text-center border border-dashed border-white/10 rounded-xl text-muted-foreground">
               Nenhum username encontrado recentemente.
             </div>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
        {categories.map((category) => (
          <Link href={`/dashboard/category/${category.id}`} key={category.id}>
            <Card className={`h-full transition-all duration-300 hover:-translate-y-1 ${category.color} glass-card border backdrop-blur-sm group`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="p-2 rounded-lg bg-background/50 border border-white/5 group-hover:bg-white/10 transition-colors">
                  {category.icon}
                </div>
                <Badge variant="outline" className="bg-background/50 border-white/10 text-xs">
                  <Sparkles className="mr-1 h-3 w-3 text-yellow-500" /> Explorar
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{category.name}</CardTitle>
                <div className="text-sm text-muted-foreground mb-6 h-10">
                  {category.description}
                </div>
                <div className="flex items-center text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">
                  Ver Lista <ArrowRight className="ml-2 h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
