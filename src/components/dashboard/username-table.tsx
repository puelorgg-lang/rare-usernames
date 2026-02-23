"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Copy, Filter, RefreshCw, X } from "lucide-react"
import { PLATFORMS, Platform } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Layers } from "lucide-react"

interface Username {
  id: string
  name: string
  platform: string
  status: string
  foundAt: Date
  availableDate?: Date | null
}

interface UsernameTableProps {
  usernames: Username[]
  category: string
  totalCount?: number
  currentPage?: number
  currentLimit?: number
}

export function UsernameTable({ usernames, category, totalCount, currentPage = 1, currentLimit = 100 }: UsernameTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPlatform = searchParams.get("platform")

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [checkingId, setCheckingId] = useState<string | null>(null)

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRecheck = async (id: string, username: string, platform: string) => {
    setCheckingId(id)
    try {
      const res = await fetch(`/api/check?username=${encodeURIComponent(username)}&platform=${platform}`)
      const data = await res.json()
      
      if (data.available) {
        alert(`${username} AINDA ESTÁ DISPONÍVEL!`)
      } else {
        alert(`${username} já foi pego.`)
      }
    } catch (error) {
      console.error("Falha na verificação", error)
    } finally {
      setCheckingId(null)
    }
  }

  const handlePlatformFilter = (platform: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (platform) {
      params.set("platform", platform)
    } else {
      params.delete("platform")
    }
    params.set("page", "1") // Reset to first page when filter changes
    router.push(`?${params.toString()}`)
  }

  const handleLimitChange = (limit: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("limit", limit)
    params.set("page", "1") // Reset to first page when limit changes
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`?${params.toString()}`)
  }

  const totalPages = totalCount ? Math.ceil(totalCount / currentLimit) : 1

  const platformColors: Record<string, string> = {
    DISCORD: "bg-[#5865F2] hover:bg-[#5865F2]/80",
    MINECRAFT: "bg-green-600 hover:bg-green-600/80",
    INSTAGRAM: "bg-pink-600 hover:bg-pink-600/80",
    GITHUB: "bg-gray-700 hover:bg-gray-700/80",
    ROBLOX: "bg-red-600 hover:bg-red-600/80",
    TIKTOK: "bg-black hover:bg-gray-900",
    TWITTER: "bg-blue-400 hover:bg-blue-400/80",
    URLS: "bg-orange-500 hover:bg-orange-500/80",
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">{category.replace("_", " ")} Usernames</h2>
        <div className="flex items-center gap-2">
          {/* Limit Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-white/10 bg-white/5 hover:bg-white/10">
                <Layers className="mr-2 h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {currentLimit} por página
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur border-white/10">
              <DropdownMenuItem onClick={() => handleLimitChange("25")}>
                25 por página
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLimitChange("50")}>
                50 por página
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLimitChange("100")}>
                100 por página
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Platform Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-white/10 bg-white/5 hover:bg-white/10">
                <Filter className="mr-2 h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {currentPlatform || "Todas as Plataformas"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur border-white/10">
              <DropdownMenuItem onClick={() => handlePlatformFilter(null)}>
                Todas as Plataformas
              </DropdownMenuItem>
              {Object.keys(PLATFORMS).map((p) => (
                <DropdownMenuItem key={p} onClick={() => handlePlatformFilter(p)}>
                  {p}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Username</TableHead>
              <TableHead className="text-muted-foreground font-medium">Plataforma</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="hidden md:table-cell text-muted-foreground font-medium">Encontrado em</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usernames.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-white/[0.02]">
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Nenhum username encontrado nesta categoria.
                </TableCell>
              </TableRow>
            ) : (
              usernames.map((username) => (
                <TableRow key={username.id} className="border-white/5 hover:bg-white/[0.04] transition-colors">
                  <TableCell className="font-mono font-medium text-base">{username.name}</TableCell>
                  <TableCell>
                    <Badge className={`${platformColors[username.platform] || "bg-secondary"} border-0 text-white shadow-sm`}>
                      {username.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      username.status === "AVAILABLE" 
                        ? "border-green-500/20 bg-green-500/10 text-green-500" 
                        : username.status === "PENDING"
                        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
                        : "border-red-500/20 bg-red-500/10 text-red-500"
                    }>
                      {username.status === "AVAILABLE" ? "DISPONÍVEL" : username.status === "PENDING" ? "PENDENTE" : username.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {username.status === "PENDING" && username.availableDate ? (
                      <span className="text-yellow-500" title={`Disponível em: ${new Date(username.availableDate).toLocaleDateString()}`}>
                        {new Date(username.availableDate).toLocaleDateString()}
                      </span>
                    ) : (
                      new Date(username.foundAt).toLocaleDateString()
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10"
                        onClick={() => handleRecheck(username.id, username.name, username.platform)}
                        disabled={checkingId === username.id}
                      >
                         <RefreshCw className={`h-4 w-4 ${checkingId === username.id ? "animate-spin" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10"
                        onClick={() => handleCopy(username.id, username.name)}
                      >
                        {copiedId === username.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copiar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Info */}
      {totalCount !== undefined && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {((currentPage - 1) * currentLimit) + 1} - {Math.min(currentPage * currentLimit, totalCount)} de {totalCount} resultados
          </span>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page indicators */}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${currentPage === pageNum ? "bg-primary" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
