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
import { Save, Copy, Check, ExternalLink, Webhook, Loader2 } from "lucide-react"

interface WebhookConfig {
  channelId: string
  category: string
  platform: string
  isActive?: boolean
  id?: string
}

const PLATFORMS = [
  { value: "discord", label: "Discord", color: "#5865F2" },
  { value: "minecraft", label: "Minecraft", color: "#62B47A" },
  { value: "instagram", label: "Instagram", color: "#E1306C" },
  { value: "github", label: "GitHub", color: "#FFFFFF" },
  { value: "roblox", label: "Roblox", color: "#E2231A" },
  { value: "tiktok", label: "TikTok", color: "#000000" },
  { value: "twitter", label: "Twitter", color: "#1DA1F2" },
  { value: "urls", label: "URLs", color: "#FF6B00" },
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
  const [initialLoading, setInitialLoading] = useState(true)

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/webhooks/discord`
    : ""

  // Load webhooks from database on mount
  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      setInitialLoading(true)
      const res = await fetch("/api/admin/webhooks")
      if (res.ok) {
        const data = await res.json()
        setWebhooks(data.map((w: any) => ({
          channelId: w.channelId,
          category: w.category,
          platform: w.platform,
          isActive: w.isActive,
          id: w.id
        })))
      }
    } catch (error) {
      console.error("Error fetching webhooks:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const saveWebhooks = async (newWebhooks: WebhookConfig[]) => {
    setWebhooks(newWebhooks)
  }

  const addWebhook = async () => {
    if (!newChannelId.trim()) {
      toastError("Por favor, insira o ID do canal")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: newChannelId.trim(),
          category: newCategory,
          platform: newPlatform
        })
      })

      if (res.ok) {
        const saved = await res.json()
        setWebhooks([...webhooks, { 
          channelId: saved.channelId, 
          category: saved.category, 
          platform: saved.platform,
          isActive: saved.isActive,
          id: saved.id
        }])
        toastSuccess("Webhook salvo com sucesso!")
        setNewChannelId("")
      } else {
        const error = await res.json()
        toastError(error.error || "Erro ao salvar webhook")
      }
    } catch (error) {
      console.error("Error adding webhook:", error)
      toastError("Erro ao salvar webhook")
    } finally {
      setLoading(false)
    }
  }

  const removeWebhook = async (channelId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/webhooks?channelId=${channelId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setWebhooks(webhooks.filter(w => w.channelId !== channelId))
        toastSuccess("Webhook removido!")
      } else {
        toastError("Erro ao remover webhook")
      }
    } catch (error) {
      console.error("Error removing webhook:", error)
      toastError("Erro ao remover webhook")
    } finally {
      setLoading(false)
    }
  }

  const updateWebhookCategory = async (channelId: string, category: string) => {
    const webhook = webhooks.find(w => w.channelId === channelId)
    if (!webhook) return

    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          category,
          platform: webhook.platform
        })
      })

      if (res.ok) {
        setWebhooks(webhooks.map(w => 
          w.channelId === channelId ? { ...w, category } : w
        ))
        toastSuccess("Categoria atualizada!")
      }
    } catch (error) {
      console.error("Error updating webhook:", error)
      toastError("Erro ao atualizar webhook")
    }
  }

  const updateWebhookPlatform = async (channelId: string, platform: string) => {
    const webhook = webhooks.find(w => w.channelId === channelId)
    if (!webhook) return

    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          platform,
          category: webhook.category
        })
      })

      if (res.ok) {
        setWebhooks(webhooks.map(w => 
          w.channelId === channelId ? { ...w, platform } : w
        ))
        toastSuccess("Plataforma atualizada!")
      }
    } catch (error) {
      console.error("Error updating webhook:", error)
      toastError("Erro ao atualizar webhook")
    }
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    toastSuccess("URL copiada para a área de transferência!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
                      {platform.label}
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
          <Button 
            onClick={addWebhook} 
            className="bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
                    {platform.label}
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
                .map((webhook) => {
                  const platform = PLATFORMS.find(p => p.value === webhook.platform) || PLATFORMS[0]
                  return (
                    <div 
                      key={webhook.channelId}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium"
                          style={{ backgroundColor: `${platform.color}20`, border: `1px solid ${platform.color}30`, color: platform.color }}
                        >
                          {platform.label.substring(0, 2).toUpperCase()}
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
                          onValueChange={(value) => updateWebhookPlatform(webhook.channelId, value)}
                        >
                          <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PLATFORMS.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select 
                          value={webhook.category} 
                          onValueChange={(value) => updateWebhookCategory(webhook.channelId, value)}
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
                          onClick={() => removeWebhook(webhook.channelId)}
                          disabled={loading}
                          className="ml-4 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "×"}
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
