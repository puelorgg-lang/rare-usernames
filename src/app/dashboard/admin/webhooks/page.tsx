"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

const toastSuccess = (message: string) => {
  toast({
    title: "Sucesso",
    description: message,
    variant: "default",
  })
}

const toastError = (message: string) => {
  toast({
    title: "Erro",
    description: message,
    variant: "destructive",
  })
}
import { Save, Copy, Check, ExternalLink, Webhook } from "lucide-react"

interface WebhookConfig {
  channelId: string
  category: string
  platform: string
}

const PLATFORMS = [
  { value: "discord", label: "Discord", color: "#5865F2", icon: "💬" },
  { value: "roblox", label: "Roblox", color: "#E2231A", icon: "🎮" },
  { value: "minecraft", label: "Minecraft", color: "#62B47A", icon: "⛏️" },
  { value: "instagram", label: "Instagram", color: "#E1306C", icon: "📸" },
  { value: "youtube", label: "YouTube", color: "#FF0000", icon: "▶️" },
  { value: "tiktok", label: "TikTok", color: "#000000", icon: "🎵" },
  { value: "twitter", label: "Twitter/X", color: "#1DA1F2", icon: "🐦" },
]

const CATEGORIES = [
  { value: "CHARS_2", label: "2 Caracteres" },
  { value: "CHARS_3", label: "3 Caracteres" },
  { value: "CHARS_4", label: "4 Caracteres" },
  { value: "PT_BR", label: "Palavras PT-BR" },
  { value: "EN_US", label: "Palavras EN-US" },
  { value: "RANDOM", label: "Aleatórios" },
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [newChannelId, setNewChannelId] = useState("")
  const [newCategory, setNewCategory] = useState("CHARS_2")
  const [newPlatform, setNewPlatform] = useState("discord")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/webhooks/discord`
    : ""

  useEffect(() => {
    // Load saved webhooks from localStorage
    const saved = localStorage.getItem("discord_webhooks")
    if (saved) {
      setWebhooks(JSON.parse(saved))
    }
  }, [])

  const saveWebhooks = (newWebhooks: WebhookConfig[]) => {
    setWebhooks(newWebhooks)
    localStorage.setItem("discord_webhooks", JSON.stringify(newWebhooks))
    toastSuccess("Webhooks salvos com sucesso!")
  }

  const addWebhook = () => {
    if (!newChannelId.trim()) {
      toastError("Por favor, insira o ID do canal")
      return
    }

    const newWebhooks = [...webhooks, { channelId: newChannelId.trim(), category: newCategory, platform: newPlatform }]
    saveWebhooks(newWebhooks)
    setNewChannelId("")
  }

  const removeWebhook = (index: number) => {
    const newWebhooks = webhooks.filter((_, i) => i !== index)
    saveWebhooks(newWebhooks)
  }

  const updateWebhookCategory = (index: number, category: string) => {
    const newWebhooks = [...webhooks]
    newWebhooks[index].category = category
    saveWebhooks(newWebhooks)
  }

  const updateWebhookPlatform = (index: number, platform: string) => {
    const newWebhooks = [...webhooks]
    newWebhooks[index].platform = platform
    saveWebhooks(newWebhooks)
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    toastSuccess("URL copiada para a área de transferência!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Configuração de Webhooks</h2>
        <p className="text-muted-foreground mt-2">
          Configure os webhooks do Discord para receber usernames automaticamente.
        </p>
      </div>

      {/* Webhook URL Card */}
      <Card className="glass-card border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            URLs do Webhook por Categoria
          </CardTitle>
          <CardDescription>
            Use estas URLs nas configurações de webhook do Discord. Cada URL está associada a uma categoria.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const categoryUrl = `${webhookUrl}?category=${cat.value}`
              return (
                <div key={cat.value} className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <p className="font-medium mb-2">{cat.label}</p>
                  <div className="flex gap-2">
                    <Input 
                      value={categoryUrl} 
                      readOnly 
                      className="bg-black/30 border-white/10 font-mono text-xs h-9"
                    />
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(categoryUrl)
                        toastSuccess("URL copiada!")
                      }} 
                      variant="secondary" 
                      size="icon"
                      className="shrink-0 h-9 w-9"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Como configurar no Discord:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Vá nas configurações do servidor → Integrações</li>
              <li>Crie um novo Webhook</li>
              <li>Cole a URL acima no campo URL do Webhook</li>
              <li>Selecione o canal que terá os usernames</li>
              <li>Salve e pronto!</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Add New Webhook */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Adicionar Canal</CardTitle>
          <CardDescription>
            Associe um canal do Discord a uma categoria do site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="channelId">ID do Canal do Discord</Label>
              <Input
                id="channelId"
                placeholder="Ex: 123456789012345678"
                value={newChannelId}
                onChange={(e) => setNewChannelId(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                Para encontrar o ID do canal, ative o modo desenvolvedor no Discord
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma</Label>
              <Select value={newPlatform} onValueChange={setNewPlatform}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Selecione uma plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <span className="flex items-center gap-2">
                        <span>{platform.icon}</span>
                        <span>{platform.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addWebhook} className="bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            Adicionar Mapeamento
          </Button>
        </CardContent>
      </Card>

      {/* Configured Webhooks */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Canais Configurados</CardTitle>
          <CardDescription>
            Canais do Discord que estão enviando usernames para o site
          </CardDescription>
          {/* Platform Filter */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Filtrar por:</span>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                <SelectValue placeholder="Todas as plataformas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as plataformas</SelectItem>
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <span className="flex items-center gap-2">
                      <span>{platform.icon}</span>
                      <span>{platform.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum canal configurado ainda.</p>
              <p className="text-sm">Adicione um canal acima para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks
                .filter(w => platformFilter === "all" || w.platform === platformFilter)
                .map((webhook, index) => {
                  const platform = PLATFORMS.find(p => p.value === webhook.platform) || PLATFORMS[0]
                  const originalIndex = webhooks.indexOf(webhook)
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${platform.color}20`, border: `1px solid ${platform.color}30` }}
                        >
                          {platform.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-mono text-sm">{webhook.channelId}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Plataforma: <span style={{ color: platform.color }}>{platform.label}</span> • Enviando para: {
                              CATEGORIES.find(c => c.value === webhook.category)?.label
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={webhook.platform} 
                          onValueChange={(value) => updateWebhookPlatform(originalIndex, value)}
                        >
                          <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PLATFORMS.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                <span className="flex items-center gap-2">
                                  <span>{p.icon}</span>
                                  <span>{p.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select 
                          value={webhook.category} 
                          onValueChange={(value) => updateWebhookCategory(originalIndex, value)}
                        >
                          <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeWebhook(originalIndex)}
                          className="ml-4 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Formato das Mensagens</CardTitle>
          <CardDescription>
            Como enviar usernames via webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>O webhook aceita usernames nos seguintes formatos:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Um username por linha</li>
              <li>Sem caracteres especiais (@, #, etc)</li>
              <li>Apenas letras, números e underscore</li>
            </ul>
          </div>
          <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
            <p className="text-green-400 mb-2">Exemplo de mensagem válida:</p>
            <pre className="text-gray-300">
{`rareuser
ogname
premium
admin123
test_user`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
