
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ScannerButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleStartScanner = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/scanner", {
        method: "POST",
        body: JSON.stringify({ count: 5 }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: "Scanner Concluído",
          description: data.message || "Novos usernames encontrados.",
          variant: "default", // or use "success" if configured
        })
      } else {
        throw new Error(data.error || "Failed to scan")
      }
    } catch (error) {
      toast({
        title: "Erro no Scanner",
        description: "Falha ao iniciar o processo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleStartScanner} 
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      {loading ? "Escaneando..." : "Iniciar Scanner Manual"}
    </Button>
  )
}
