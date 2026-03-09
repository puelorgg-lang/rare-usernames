import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Hash, Globe, Ghost, Sparkles, TrendingUp, Clock, CheckCircle2, Lock } from "lucide-react"
import prisma from "@/lib/prisma"
import { CATEGORY_LABELS, Category } from "@/lib/constants"
import { AutoRefresh } from "@/components/dashboard/auto-refresh"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isPremiumUser, FREE_CATEGORIES, PREMIUM_CATEGORIES } from "@/lib/subscription"

// Força atualização a cada requisição
export const dynamic = 'force-dynamic'

const premiumCategories = [
  { id: "chars_2", name: "2 Caracteres", description: "Combinações ultra raras de 2 letras.", icon: <Hash className="h-6 w-6 text-red-400" />, color: "border-red-500/20 bg-red-500/5 hover:border-red-500/50" },
  { id: "chars_3", name: "3 Caracteres", description: "Nomes de 3 letras muito procurados.", icon: <Hash className="h-6 w-6 text-orange-400" />, color: "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/50" },
  { id: "chars_4", name: "4 Caracteres", description: "Usernames limpos de 4 letras.", icon: <Hash className="h-6 w-6 text-yellow-400" />, color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50" },
  { id: "pt_br", name: "Palavras PT-BR", description: "Melhores palavras em Português.", icon: <Globe className="h-6 w-6 text-green-400" />, color: "border-green-500/20 bg-green-500/5 hover:border-green-500/50" },
  { id: "en_us", name: "Palavras EN-US", description: "Palavras premium do dicionário inglês.", icon: <Globe className="h-6 w-6 text-blue-400" />, color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50" },
  { id: "random", name: "Aleatórios", description: "Descobertas únicas e legais.", icon: <Ghost className="h-6 w-6 text-white" />, color: "border-white/20 bg-white/5 hover:border-white/50" },
]

const freeCategories = [
  { id: "4c", name: "4C", description: "4 Character combinations.", icon: <Hash className="h-6 w-6 text-purple-400" />, color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/50" },
  { id: "pt_br_2", name: "PT-BR", description: "Palavras em Português Brasileiro.", icon: <Globe className="h-6 w-6 text-green-400" />, color: "border-green-500/20 bg-green-500/5 hover:border-green-500/50" },
  { id: "ponctuated", name: "Ponctuated", description: "Nomes com pontuação.", icon: <Hash className="h-6 w-6 text-pink-400" />, color: "border-pink-500/20 bg-pink-500/5 hover:border-pink-500/50" },
  { id: "en_us_2", name: "EN-US", description: "Palavras em Inglês Americano.", icon: <Globe className="h-6 w-6 text-blue-400" />, color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50" },
  { id: "repeaters", name: "Repeaters", description: "Nomes com caracteres repetidos.", icon: <Hash className="h-6 w-6 text-cyan-400" />, color: "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/50" },
  { id: "face", name: "FACE", description: "Nomes tipo face.", icon: <Hash className="h-6 w-6 text-amber-400" />, color: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/50" },
  { id: "4l", name: "4L", description: "4 Letras.", icon: <Hash className="h-6 w-6 text-yellow-400" />, color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50" },
  { id: "3c", name: "3C", description: "3 Caracteres.", icon: <Hash className="h-6 w-6 text-orange-400" />, color: "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/50" },
  { id: "4n", name: "4N", description: "4 Números.", icon: <Hash className="h-6 w-6 text-green-400" />, color: "border-green-500/20 bg-green-500/5 hover:border-green-500/50" },
  { id: "3l", name: "3L", description: "3 Letras.", icon: <Hash className="h-6 w-6 text-red-400" />, color: "border-red-500/20 bg-red-500/5 hover:border-red-500/50" },
]

export default async function DashboardPage() {
  // Get current user and check premium status
  const isPremium = await isPremiumUser()
  
  // Get latest usernames based on subscription
  // Free users: only see FREE_CATEGORIES
  // Premium users: see ALL categories
  const latestUsernames = await prisma.username.findMany({
    where: { 
      status: "AVAILABLE",
      ...(isPremium ? {} : { category: { in: FREE_CATEGORIES } })
    },
    take: 4,
    orderBy: { foundAt: "desc" },
  })

  const totalAvailable = await prisma.username.count({
    where: { 
      status: "AVAILABLE",
      ...(isPremium ? {} : { category: { in: FREE_CATEGORIES } })
    },
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
                {CATEGORY_LABELS[u.category as Category] || u.category}
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
      
      <Tabs defaultValue={isPremium ? "premium" : "free"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
          {isPremium && (
            <TabsTrigger value="premium" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black data-[state=active]:font-bold">
              <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
              Premium
            </TabsTrigger>
          )}
          <TabsTrigger value="free" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Globe className="mr-2 h-4 w-4 text-green-500" />
            Free
          </TabsTrigger>
        </TabsList>
        
        {isPremium && (
          <TabsContent value="premium" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {premiumCategories.map((category) => (
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
          </TabsContent>
        )}
        
        <TabsContent value="free" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {freeCategories.map((category) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
