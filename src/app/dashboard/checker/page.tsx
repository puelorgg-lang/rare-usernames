"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Loader2, Search } from "lucide-react"

type CheckResult = {
  platform: string
  username: string
  available: boolean
  status: "AVAILABLE" | "TAKEN" | "ERROR"
  message?: string
}

export default function CheckerPage() {
  const [username, setUsername] = useState("")
  const [platform, setPlatform] = useState("MINECRAFT")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)

  const handleCheck = async () => {
    if (!username) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`/api/check?username=${encodeURIComponent(username)}&platform=${platform}`)
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({
        platform,
        username,
        available: false,
        status: "ERROR",
        message: "Falha ao conectar ao servidor"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Verificador em Tempo Real</h2>
        <p className="text-muted-foreground mt-2">
          Verifique a disponibilidade em múltiplas plataformas instantaneamente.
        </p>
      </div>

      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <CardTitle>Verificar Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MINECRAFT">Minecraft</SelectItem>
                <SelectItem value="ROBLOX">Roblox</SelectItem>
                <SelectItem value="GITHUB">GitHub</SelectItem>
                <SelectItem value="DISCORD">Discord (Sim)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCheck} disabled={loading || !username} className="bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Verificar</span>
            </Button>
          </div>

          {result && (
            <div className={`mt-6 p-4 rounded-lg border flex items-center gap-4 ${
              result.available 
                ? "bg-green-500/10 border-green-500/20 text-green-500" 
                : result.status === "ERROR"
                  ? "bg-red-500/10 border-red-500/20 text-red-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                result.available ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {result.available ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="font-bold text-lg">
                  {result.available ? "Disponível!" : "Indisponível / Erro"}
                </h4>
                <p className="text-sm opacity-90">
                  {result.message || (result.available 
                    ? `O username "${result.username}" parece estar disponível no ${result.platform}.`
                    : `O username "${result.username}" já está em uso no ${result.platform}.`
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
