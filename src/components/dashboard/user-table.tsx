
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Shield, ShieldAlert, UserCog } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface User {
  id: string
  discordId: string
  email: string
  image: string | null
  role: string
  subscriptionStatus: string
  createdAt: Date
}

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  const handleUpdateRole = async (userId: string, role: string) => {
     try {
       const res = await fetch("/api/admin/users", {
         method: "PATCH",
         body: JSON.stringify({ userId, role }),
       })
       if (res.ok) {
         toast({ title: "Sucesso", description: `Role atualizada para ${role}` })
         router.refresh()
       } else {
         throw new Error("Failed")
       }
     } catch (e) {
       toast({ title: "Erro", description: "Falha ao atualizar", variant: "destructive" })
     }
  }

  const handleUpdateSubscription = async (userId: string, status: string) => {
     try {
       const res = await fetch("/api/admin/users", {
         method: "PATCH",
         body: JSON.stringify({ userId, subscriptionStatus: status }),
       })
       if (res.ok) {
         toast({ title: "Sucesso", description: `Assinatura atualizada para ${status}` })
         router.refresh()
       } else {
         throw new Error("Failed")
       }
     } catch (e) {
       toast({ title: "Erro", description: "Falha ao atualizar", variant: "destructive" })
     }
  }

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="w-[80px]">Avatar</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Assinatura</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.04]">
              <TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback>{user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{user.email}</span>
                  <span className="text-xs text-muted-foreground">{user.discordId}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                 <Badge variant={user.subscriptionStatus === "ACTIVE" ? "default" : "outline"} className={user.subscriptionStatus === "ACTIVE" ? "bg-green-600 hover:bg-green-700" : ""}>
                  {user.subscriptionStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleUpdateSubscription(user.id, "ACTIVE")}>
                      <Shield className="mr-2 h-4 w-4 text-green-500" /> Ativar Assinatura
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateSubscription(user.id, "INACTIVE")}>
                      <ShieldAlert className="mr-2 h-4 w-4 text-red-500" /> Cancelar Assinatura
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "ADMIN")}>
                      <UserCog className="mr-2 h-4 w-4 text-orange-500" /> Promover a Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "USER")}>
                      <UserCog className="mr-2 h-4 w-4" /> Rebaixar a User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
