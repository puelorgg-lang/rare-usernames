"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserMinus, Shield } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  discordId: string
  email: string
  image: string | null
  role: string
}

export default function SupportManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      })
      fetchUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  const supportUsers = users.filter(u => u.role === "SUPPORT")
  const otherUsers = users.filter(u => u.role !== "SUPPORT" && u.role !== "ADMIN")

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Gerenciar Suporte</h2>
        <p className="text-muted-foreground mt-2">
          Adicione ou remova usuários da equipe de suporte.
        </p>
      </div>

      {/* Current Support Team */}
      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Equipe de Suporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          {supportUsers.length === 0 ? (
            <p className="text-muted-foreground">Nenhum suporte cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {supportUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Users className="w-5 h-5 text-black" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.name || "Usuário sem nome"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => updateUserRole(user.id, "USER")}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promote Support */}
      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Adicionar Suporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          {otherUsers.length === 0 ? (
            <p className="text-muted-foreground">Nenhum usuário disponível para promoção.</p>
          ) : (
            <div className="space-y-3">
              {otherUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Users className="w-5 h-5 text-black" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.name || "Usuário sem nome"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => updateUserRole(user.id, "SUPPORT")}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Promover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
