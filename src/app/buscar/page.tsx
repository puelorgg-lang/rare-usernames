"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, Image, User, Eye, MessageCircle, Phone, Users, Link2, GitBranch, BarChart3, Shield, UserCircle, Moon, Palette, Badge } from "lucide-react"

type ProfileData = {
  userId: string
  username?: string
  displayName?: string
  avatar?: string
  banner?: string
  tag?: string
  status?: string
  createdAt?: string
  flags?: string[]
  nitro?: boolean
  nitroBoost?: number
  searchCategory?: string
  profile?: {
    biography?: string | null
    pronouns?: string | null
  }
  messages?: any[]
  calls?: any[]
  servers?: any[]
  alts?: any[]
  connections?: any[]
  interactions?: any[]
  statistics?: {
    accountAge?: number
    friendCount?: number
    mutualGuilds?: number
  }
  bans?: any[]
  badges?: string[]
}

const searchOptions = [
  { id: "perfil", label: "Perfil", icon: UserCircle },
  { id: "avatares", label: "Avatares", icon: Image },
  { id: "mensagens", label: "Mensagens", icon: MessageCircle },
  { id: "chamadas", label: "Chamadas", icon: Phone },
  { id: "servidores", label: "Servidores", icon: Users },
  { id: "alts", label: "Alts", icon: Link2 },
  { id: "conexoes", label: "Conexões", icon: Link2 },
  { id: "interacoes", label: "Interações", icon: GitBranch },
  { id: "estatisticas", label: "Estatísticas", icon: BarChart3 },
  { id: "banimentos", label: "Banimentos", icon: Shield },
]

export default function BuscarPage() {
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("perfil")
  const [avatarPage, setAvatarPage] = useState(0)
  const [avatarHistory, setAvatarHistory] = useState<any[]>([])
  const [bannerHistory, setBannerHistory] = useState<any[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(false)

  // Trigger search for profile when tab changes to get fresh data
  useEffect(() => {
    if (userId && activeTab) {
      console.log('🔄 Tab changed to:', activeTab, 'userId:', userId)
      // Always search for profile data when changing tabs
      handleSearch()
    }
  }, [activeTab, userId])

  // Track newly searched categories

  useEffect(() => {
    if (result?.userId && activeTab === "avatares") {
      fetchAvatarHistory(result.userId)
    }
  }, [activeTab, result?.userId])

  const handleSearch = async () => {
    console.log('🔍 handleSearch called - userId:', userId, 'activeTab:', activeTab)
    if (!userId) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(userId)}&option=perfil&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })
      const data = await res.json()
      console.log('📥 Search response:', data)
      
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
        // Fetch history after successful search
        if (data.userId) {
          fetchAvatarHistory(data.userId)
          fetchBannerHistory(data.userId)
        }
      }
    } catch (err) {
      setError("Falha ao conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  }

  const getBadgeImage = (flag: string): string => {
    const badgeUrls: Record<string, string> = {
      "NITRO": "https://github.com/mezotv/discord-badges/raw/main/assets/discordnitro.svg",
      "NITRO_BASIC": "https://github.com/mezotv/discord-badges/raw/main/assets/discordnitro.svg",
      "NITRO_BOOST": "https://github.com/mezotv/discord-badges/raw/main/assets/discordnitro.svg",
      "ORBS_APPRENTICE": "https://github.com/mezotv/discord-badges/raw/main/assets/orb.svg",
      "QUEST": "https://github.com/mezotv/discord-badges/raw/main/assets/quest.png",
      "ORIGINALLY_KNOWN_AS": "https://github.com/mezotv/discord-badges/raw/main/assets/username.png",
      "EARLY_SUPPORTER": "https://github.com/mezotv/discord-badges/raw/main/assets/discordearlysupporter.svg",
      "EARLY_VERIFIED_BOT_DEVELOPER": "https://github.com/mezotv/discord-badges/raw/main/assets/discordbotdev.svg",
      "PARTNERED_SERVER_OWNER": "https://github.com/mezotv/discord-badges/raw/main/assets/discordpartner.svg",
      "HYPESQUAD_BRILLIANCE": "https://github.com/mezotv/discord-badges/raw/main/assets/hypesquadbrilliance.svg",
      "HYPESQUAD_BRAVERY": "https://github.com/mezotv/discord-badges/raw/main/assets/hypesquadbravery.svg",
      "HYPESQUAD_BALANCE": "https://github.com/mezotv/discord-badges/raw/main/assets/hypesquadbalance.svg",
      "DISCORD_EMPLOYEE": "https://github.com/mezotv/discord-badges/raw/main/assets/staff.png",
      "DISCORD_PARTNER": "https://github.com/mezotv/discord-badges/raw/main/assets/discordpartner.svg",
      "VERIFIED_BOT": "https://github.com/mezotv/discord-badges/raw/main/assets/verifiedbot.svg",
    }
    return badgeUrls[flag.toUpperCase()] || "https://github.com/mezotv/discord-badges/raw/main/assets/discordnitro.svg"
  }

  const fetchAvatarHistory = async (discordId: string) => {
    setLoadingAvatars(true)
    try {
      const res = await fetch(`/api/avatar-history?discordId=${discordId}`)
      const data = await res.json()
      setAvatarHistory(data)
    } catch (e) {
      console.error("Error fetching avatar history:", e)
    } finally {
      setLoadingAvatars(false)
    }
  }

  const fetchBannerHistory = async (discordId: string) => {
    try {
      const res = await fetch(`/api/banner-history?discordId=${discordId}`)
      const data = await res.json()
      setBannerHistory(data)
    } catch (e) {
      console.error("Error fetching banner history:", e)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-24 pb-12">
      <div className="container">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight glow-text">Buscar Profile</h1>
            <p className="text-muted-foreground mt-2">
              Busque informações detalhadas de perfis do Discord
            </p>
          </div>

          {/* Search Input */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Digite o ID ou username do Discord..."
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 text-lg"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={loading || !userId} 
                  className="bg-primary hover:bg-primary/90 text-black h-12 px-8 text-lg"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="ml-2">Buscar</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/20 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {result && !error && (
            <div className="space-y-6">
              {/* Profile Header */}
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {result.avatar && (
                      <div className="relative">
                        <img 
                          src={result.avatar} 
                          alt="Avatar" 
                          className={`h-32 w-32 rounded-full border-4 ${
                            result.status === 'online' ? 'border-green-500' :
                            result.status === 'idle' ? 'border-yellow-500' :
                            result.status === 'dnd' ? 'border-red-500' :
                            'border-gray-500'
                          }`}
                        />
                        {/* Status indicator */}
                        <span className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-[#0b0b0d] flex items-center justify-center ${
                          result.status === 'online' ? 'bg-green-500' :
                          result.status === 'idle' ? 'bg-yellow-500' :
                          result.status === 'dnd' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}>
                          {result.status === 'idle' && (
                            <Moon className="h-3 w-3 text-black" />
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">{result.displayName || result.username}</h2>
                        {result.nitro && (
                          <span className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-bold">
                            NITRO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {result.userId}</p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {formatDate(result.createdAt)}
                      </p>
                      {result.statistics?.accountAge && (
                        <p className="text-sm text-muted-foreground">
                          Idade da conta: {result.statistics.accountAge} dias
                        </p>
                      )}
                    </div>
                    {result.banner && (
                      <img 
                        src={result.banner} 
                        alt="Banner" 
                        className="h-32 rounded-lg border border-white/10"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Search Options Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-10 w-full h-auto p-1 flex-wrap">
                  {searchOptions.map((option) => (
                    <TabsTrigger 
                      key={option.id} 
                      value={option.id}
                      className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-black"
                    >
                      <option.icon className="h-4 w-4" />
                      <span className="text-xs">{option.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Perfil Tab */}
                <TabsContent value="perfil" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5" />
                        Informações do Perfil
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white/5">
                          <p className="text-sm text-muted-foreground">Usuário</p>
                          <p className="font-medium">{result.username}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5">
                          <p className="text-sm text-muted-foreground">ID</p>
                          <p className="font-medium">{result.userId}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5">
                          <p className="text-sm text-muted-foreground">Criado em</p>
                          <p className="font-medium">{formatDate(result.createdAt)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5">
                          <p className="text-sm text-muted-foreground">Insígnias</p>
                          {result.flags && result.flags.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {result.flags.slice(0, 6).map((flag: string, index: number) => (
                                <img 
                                  key={index}
                                  src={getBadgeImage(flag)} 
                                  alt={flag} 
                                  className="h-8 w-8"
                                  title={flag}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="font-medium">Nenhuma</p>
                          )}
                        </div>
                        <div className="p-4 rounded-lg bg-white/5">
                          <p className="text-sm text-muted-foreground">Servidores em comum</p>
                          <p className="font-medium">{result.statistics?.mutualGuilds || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Avatares Tab */}
                <TabsContent value="avatares" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Histórico de Avatares
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <p className="text-muted-foreground">Total de avatares: {avatarHistory.length}</p>
                      </div>
                      
                      {loadingAvatars ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : avatarHistory.length > 0 ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {avatarHistory.slice(avatarPage * 4, (avatarPage + 1) * 4).map((avatar: any, index: number) => (
                              <div key={index} className="p-3 rounded-lg bg-white/5">
                                <img 
                                  src={avatar.avatarUrl} 
                                  alt="Avatar" 
                                  className="w-full h-auto rounded-lg"
                                />
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                  {formatDate(avatar.changedAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          {avatarHistory.length > 4 && (
                            <div className="flex items-center justify-center gap-4 mt-6">
                              <Button
                                variant="outline"
                                onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                                disabled={avatarPage === 0}
                              >
                                Anterior
                              </Button>
                              <span className="text-sm text-muted-foreground">
                                Página {avatarPage + 1} de {Math.ceil(avatarHistory.length / 4)}
                              </span>
                              <Button
                                variant="outline"
                                onClick={() => setAvatarPage(p => p + 1)}
                                disabled={(avatarPage + 1) * 4 >= avatarHistory.length}
                              >
                                Próxima
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          Nenhum histórico de avatar encontrado
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Servidores Tab */}
                <TabsContent value="servidores" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Servidores em Comum
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.servers && result.servers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.servers.map((server: any, index: number) => (
                            <div key={index} className="p-4 rounded-lg bg-white/5 flex items-center gap-3">
                              {server.icon ? (
                                <img src={server.icon} alt={server.name} className="h-10 w-10 rounded-full" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                  <Users className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{server.name}</p>
                                <p className="text-xs text-muted-foreground">Entrou em: {formatDate(server.joinedAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          Nenhum servidor em comum encontrado
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Estatísticas Tab */}
                <TabsContent value="estatisticas" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Estatísticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 text-center">
                          <p className="text-3xl font-bold">{result.statistics?.accountAge || 0}</p>
                          <p className="text-sm text-muted-foreground">Dias de conta</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 text-center">
                          <p className="text-3xl font-bold">{result.statistics?.friendCount || 0}</p>
                          <p className="text-sm text-muted-foreground">Amigos</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 text-center">
                          <p className="text-3xl font-bold">{result.statistics?.mutualGuilds || 0}</p>
                          <p className="text-sm text-muted-foreground">Servidores em comum</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Other Tabs - Placeholder */}
                {["mensagens", "chamadas", "alts", "conexoes", "interacoes", "banimentos"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-4">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {tab === "mensagens" && <MessageCircle className="h-5 w-5" />}
                          {tab === "chamadas" && <Phone className="h-5 w-5" />}
                          {tab === "alts" && <Link2 className="h-5 w-5" />}
                          {tab === "conexoes" && <Link2 className="h-5 w-5" />}
                          {tab === "interacoes" && <GitBranch className="h-5 w-5" />}
                          {tab === "banimentos" && <Shield className="h-5 w-5" />}
                          {tab === "mensagens" && "Mensagens"}
                          {tab === "chamadas" && "Chamadas"}
                          {tab === "alts" && "Contas Alternativas"}
                          {tab === "conexões" && "Conexões"}
                          {tab === "interacoes" && "Interações"}
                          {tab === "banimentos" && "Banimentos"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center py-8">
                          Em breve mais informações nesta seção...
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
