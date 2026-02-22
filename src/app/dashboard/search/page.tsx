"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Image } from "lucide-react"

type ProfileData = {
  userId: string
  username?: string
  avatar?: string
  avatarDecoration?: string
}

export default function SearchPage() {
  const [userId, setUserId] = useState("")
  const [platform, setPlatform] = useState("DISCORD")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(userId)}&option=avatar`)
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
            <div className="mt-6">
              {/* Avatar Display */}
              <div className="p-4 rounded-lg border bg-white/5 border-white/10">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Avatar
                </h5>
                
                {result.avatar && (
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
              </div>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
