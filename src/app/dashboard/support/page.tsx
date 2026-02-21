
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Suporte</h2>
        <p className="text-muted-foreground mt-2">
          Precisa de ajuda? Entre em contato com nossa equipe.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Enviar Mensagem</CardTitle>
            <CardDescription>Responderemos em até 24 horas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Assunto</label>
                <Input placeholder="Sobre o que é?" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea placeholder="Descreva seu problema ou sugestão..." className="bg-white/5 border-white/10 min-h-[150px]" />
              </div>
              <Button className="w-full">Enviar Ticket</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Discord Comunidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Junte-se ao nosso servidor para suporte em tempo real, dicas de caça e para conhecer outros usuários.
              </p>
              <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                Entrar no Discord
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Email Direto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Para assuntos comerciais ou urgentes.
              </p>
              <code className="block bg-black/30 p-2 rounded text-sm text-center">
                suporte@users4u.com
              </code>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
