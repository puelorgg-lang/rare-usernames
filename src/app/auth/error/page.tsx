"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams?.error

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case "Configuration":
        return "Erro de configuração do NextAuth."
      case "AccessDenied":
        return "Acesso negado. Você cancelou o login ou não tem permissão."
      case "Verification":
        return "O link de verificação expirou ou já foi usado."
      default:
        return "Ocorreu um erro durante a autenticação."
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0d] p-4">
      <Card className="w-full max-w-md border-red-500/20 bg-black/40 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center">
            <div className="relative h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-white">Erro de Autenticação</CardTitle>
            <CardDescription className="text-muted-foreground">
              {getErrorMessage(error)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = "/auth/signin"}
            className="w-full"
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
