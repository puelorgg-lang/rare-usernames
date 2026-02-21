"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, User, MessageSquare, Image, History, Server, Eye, Clock, Palette, Award, Hash } from "lucide-react"

type ProfileData = {
  userId: string
  username?: string
  avatar?: string
  banner?: string
  bio?: string
  createdAt?: string
  avatarDecoration?: string
  nitro?: boolean
  nitroBoost?: number
  badges?: string[]
  profileColors?: string[]
  previousUsernames?: string[]
  oldIcons?: string[]
  oldBanners?: string[]
  lastMessages?: string[]
  lastCall?: string
  servers?: string[]
  viewHistory?: string[]
  rawEmbed?: any
  rawContent?: string
  embeds?: any[]
  message?: string
}

type SearchOption = 
  | "avatar" 
  | "impulse_evolution" 
  | "nitro_evolution" 
  | "profile_colors" 
  | "previous_names" 
  | "old_icons" 
  | "old_banners" 
  | "last_messages" 
  | "last_call" 
  | "servers" 
  | "view_history"

export default function SearchPage() {
  const [userId, setUserId] = useState("")
  const [platform, setPlatform] = useState("DISCORD")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<SearchOption>("avatar")

  const handleSearch = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(userId)}&option=${selectedOption}`)
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError("Falha ao conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  const searchOptions: { value: SearchOption; label: string; icon: React.ReactNode }[] = [
    { value: "avatar", label: "Avatar", icon: <Image className="h-4 w-4" /> },
    { value: "impulse_evolution", label: "Evolução do impulso", icon: <Award className="h-4 w-4" /> },
    { value: "nitro_evolution", label: "Evolução do nitro", icon: <Award className="h-4 w-4" /> },
    { value: "profile_colors", label: "Cores do perfil", icon: <Palette className="h-4 w-4" /> },
    { value: "previous_names", label: "Nomes anteriores", icon: <History className="h-4 w-4" /> },
    { value: "old_icons", label: "Icons antigos", icon: <Image className="h-4 w-4" /> },
    { value: "old_banners", label: "Banners antigos", icon: <Image className="h-4 w-4" /> },
    { value: "last_messages", label: "Últimas mensagens", icon: <MessageSquare className="h-4 w-4" /> },
    { value: "last_call", label: "Última call", icon: <Clock className="h-4 w-4" /> },
    { value: "servers", label: "Servidores", icon: <Server className="h-4 w-4" /> },
    { value: "view_history", label: "Histórico de visualização", icon: <Eye className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Buscar Profile</h2>
        <p className="text-muted-foreground mt-2">
          Busque informações detalhadas de perfis do Discord.
        </p>
      </div>

      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <CardTitle>Buscar Profile do Discord</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o ID ou username..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISCORD">Discord</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading || !userId} className="bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Search</span>
            </Button>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-lg border bg-red-500/10 border-red-500/20 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {result && !error && (
            <div className="mt-6 space-y-6">
              {/* User Info Header */}
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-white/5 border-white/10">
                {result.avatar && (
                  <img 
                    src={result.avatar} 
                    alt="Avatar" 
                    className="h-16 w-16 rounded-full"
                  />
                )}
                <div>
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {result.username || result.userId}
                  </h4>
                  <p className="text-sm text-muted-foreground">ID: {result.userId}</p>
                  {result.nitro && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                      Nitro
                    </span>
                  )}
                </div>
              </div>

              {/* Option Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione a informação:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {searchOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedOption === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedOption(option.value)}
                      className="justify-start"
                    >
                      {option.icon}
                      <span className="ml-2 truncate">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Option Content */}
              <div className="p-4 rounded-lg border bg-white/5 border-white/10">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  {searchOptions.find(o => o.value === selectedOption)?.icon}
                  {searchOptions.find(o => o.value === selectedOption)?.label}
                </h5>
                
                {selectedOption === "avatar" && result.avatar && (
                  <div className="space-y-3">
                    <img src={result.avatar} alt="Avatar" className="max-w-[200px] rounded-lg" />
                    {result.avatarDecoration && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Avatar Decoration:</p>
                        <img src={result.avatarDecoration} alt="Avatar Decoration" className="max-w-[200px] rounded-lg" />
                      </div>
                    )}
                  </div>
                )}

                {selectedOption === "profile_colors" && result.profileColors && (
                  <div className="flex gap-2 flex-wrap">
                    {result.profileColors.map((color, i) => (
                      <div 
                        key={i} 
                        className="w-12 h-12 rounded-lg border border-white/10" 
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    {result.profileColors.length === 0 && <p className="text-muted-foreground">Nenhuma cor encontrada</p>}
                  </div>
                )}

                {selectedOption === "previous_names" && result.previousUsernames && (
                  <div className="space-y-1">
                    {result.previousUsernames.length > 0 ? (
                      result.previousUsernames.map((name, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded bg-white/5">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          {name}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhum nome anterior encontrado</p>
                    )}
                  </div>
                )}

                {selectedOption === "old_icons" && result.oldIcons && (
                  <div className="grid grid-cols-4 gap-2">
                    {result.oldIcons.length > 0 ? (
                      result.oldIcons.map((icon, i) => (
                        <img key={i} src={icon} alt={`Icon ${i}`} className="rounded-lg" />
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhum icon antigo encontrado</p>
                    )}
                  </div>
                )}

                {selectedOption === "old_banners" && result.oldBanners && (
                  <div className="space-y-2">
                    {result.oldBanners.length > 0 ? (
                      result.oldBanners.map((banner, i) => (
                        <img key={i} src={banner} alt={`Banner ${i}`} className="w-full rounded-lg" />
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhum banner antigo encontrado</p>
                    )}
                  </div>
                )}

                {selectedOption === "last_messages" && result.lastMessages && (
                  <div className="space-y-2">
                    {result.lastMessages.length > 0 ? (
                      result.lastMessages.map((msg, i) => (
                        <div key={i} className="p-2 rounded bg-white/5 text-sm">
                          <MessageSquare className="h-4 w-4 inline mr-2" />
                          {msg}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
                    )}
                  </div>
                )}

                {selectedOption === "last_call" && (
                  <p className="text-muted-foreground">{result.lastCall || "Nenhuma call encontrada"}</p>
                )}

                {selectedOption === "servers" && result.servers && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {result.servers.length > 0 ? (
                      result.servers.map((server, i) => (
                        <div key={i} className="p-2 rounded bg-white/5 flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{server}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhum servidor encontrado</p>
                    )}
                  </div>
                )}

                {selectedOption === "view_history" && result.viewHistory && (
                  <div className="space-y-2">
                    {result.viewHistory.length > 0 ? (
                      result.viewHistory.map((item, i) => (
                        <div key={i} className="p-2 rounded bg-white/5 flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhum histórico encontrado</p>
                    )}
                  </div>
                )}

                {selectedOption === "impulse_evolution" && (
                  <p className="text-muted-foreground">Evolução do impulso: Em breve</p>
                )}

                {selectedOption === "nitro_evolution" && (
                  <div className="space-y-2">
                    <p>Nitro: {result.nitro ? "✓ Ativo" : "✗ Inativo"}</p>
                    {result.nitroBoost !== undefined && <p>Boost: {result.nitroBoost}</p>}
                  </div>
                )}
              </div>

              {/* Raw Embed Data (for debugging) */}
              {(result.rawEmbed || result.rawContent) && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Ver dados completos
                  </summary>
                  {result.rawContent && (
                    <div className="mt-2 p-4 rounded-lg bg-black/50 text-sm whitespace-pre-wrap">
                      {result.rawContent}
                    </div>
                  )}
                  {result.rawEmbed && (
                    <pre className="mt-2 p-4 rounded-lg bg-black/50 text-xs overflow-auto max-h-96">
                      {JSON.stringify(result.rawEmbed, null, 2)}
                    </pre>
                  )}
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
