import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, Zap, Globe, Lock, ArrowRight, Shield, Star, Rocket, User, Sparkles } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b0d] overflow-hidden selection:bg-primary/30 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[#0b0b0d]">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0b0b0d]/80 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            
            <span className="font-bold">Users4U</span>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Preços</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-10 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.6)]">
                  Ir para Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-10 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.6)]">
                  Entrar com Discord
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="container relative py-20 md:py-32 flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/10 text-primary-foreground rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700 hover:bg-primary/20 transition-colors">
            ✨ A Ferramenta #1 de Sniping de Usernames
          </Badge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Garanta os usernames <br />
            <span className="text-primary glow-text">mais raros agora.</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Pare de adivinhar. Nosso sistema avançado monitora Discord, Minecraft e Roblox 24/7, notificando você no segundo em que ficam disponíveis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(124,58,237,0.6)] transition-all hover:scale-105">
                  Acessar Painel <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(124,58,237,0.6)] transition-all hover:scale-105">
                  Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg font-semibold border-white/10 bg-white/5 hover:bg-white/10 text-white hover:border-white/20 transition-all">
                Saiba Mais
              </Button>
            </Link>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 pt-16 opacity-80 animate-in fade-in duration-1000 delay-500">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-white">50k+</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Monitorados</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-white">1.2s</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Intervalo</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-white">99%</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Taxa de Sucesso</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uptime</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Funcionalidades Poderosas</h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              Tudo o que você precisa para garantir o nome OG que sempre quis.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              title="Velocidade Relâmpago"
              description="Nosso motor de sniper personalizado verifica a disponibilidade mais rápido do que qualquer humano poderia."
            />
            <FeatureCard 
              icon={<Globe className="h-6 w-6 text-blue-400" />}
              title="Multi-Plataforma"
              description="Uma assinatura cobre Discord, Minecraft, Roblox e as principais redes sociais."
            />
            <FeatureCard 
              icon={<Lock className="h-6 w-6 text-green-400" />}
              title="Seguro e Privado"
              description="Seus dados são criptografados. Nunca compartilhamos sua lista de alvos com outros usuários."
            />
            <FeatureCard 
              icon={<Rocket className="h-6 w-6 text-purple-400" />}
              title="Auto-Claimer"
              description="Não apenas assista. Configure nosso bot para tentar reivindicar o nome automaticamente para você."
            />
            <FeatureCard 
              icon={<Star className="h-6 w-6 text-orange-400" />}
              title="Pontuação de Raridade"
              description="Nossa IA analisa nomes para fornecer uma pontuação de raridade baseada em comprimento, significado e demanda."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-red-400" />}
              title="Proteção Contra Ban"
              description="Limitação inteligente de taxa garante que suas contas permaneçam seguras enquanto fazemos o trabalho pesado."
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-24 space-y-16 relative">
          <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10 rounded-full"></div>
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Preços Simples e Transparentes</h2>
            <p className="text-muted-foreground text-lg md:text-xl">Comece de graça, atualize para mais poder.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            <PricingCard 
              title="Iniciante"
              price="R$25"
              period="/dia"
              features={["Acesso 24h", "Monitoramento Básico", "Apenas Discord", "Reivindicação Manual"]}
              buttonText="Comprar Passe Diário"
            />
            <PricingCard 
              title="Pro"
              price="R$75"
              period="/semana"
              popular
              features={["Acesso 7 Dias", "Todas as Plataformas", "Velocidade Prioritária", "Auto-Claimer (Beta)", "Ferramentas Sniper"]}
              buttonText="Comprar Passe Semanal"
            />
            <PricingCard 
              title="Elite"
              price="R$200"
              period="/mês"
              features={["Acesso 30 Dias", "Todas as Plataformas", "Notificações Instantâneas", "IP Dedicado", "Acesso à API Privada", "Suporte VIP 24/7"]}
              buttonText="Comprar Passe Mensal"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container py-24 max-w-3xl space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">FAQ</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-white/10 rounded-lg px-4 bg-white/[0.02]">
              <AccordionTrigger className="hover:no-underline text-lg font-medium py-6">Como funciona o verificador?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                Usamos uma rede distribuída de nós para consultar as APIs das plataformas diretamente. Isso nos permite contornar os limites de taxa padrão e verificar milhares de nomes por segundo sem sermos bloqueados.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border border-white/10 rounded-lg px-4 bg-white/[0.02]">
              <AccordionTrigger className="hover:no-underline text-lg font-medium py-6">É seguro usar?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                Absolutamente. Não exigimos as senhas da sua conta. O monitoramento acontece em nossos servidores. Você só precisa fazer login em nosso painel para ver os resultados.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border border-white/10 rounded-lg px-4 bg-white/[0.02]">
              <AccordionTrigger className="hover:no-underline text-lg font-medium py-6">Posso pedir reembolso?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                Devido à natureza digital do produto, geralmente não oferecemos reembolsos depois que você acessa os dados premium. No entanto, se o serviço ficar fora do ar por mais de 24 horas, iremos compensá-lo.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/40 backdrop-blur-lg">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            
            <span>Users4U</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 Users4U. Todos os direitos reservados.</p>
          <div className="flex gap-8 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-white transition-colors">Termos</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-white transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="glass-card border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-white/10 group">
      <CardHeader>
        <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:bg-primary/20 group-hover:text-primary transition-colors duration-300 border border-white/5 group-hover:border-primary/20">{icon}</div>
        <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed text-base">{description}</p>
      </CardContent>
    </Card>
  )
}

function PricingCard({ title, price, period, features, popular, buttonText }: { title: string, price: string, period: string, features: string[], popular?: boolean, buttonText: string }) {
  return (
    <Card className={`relative flex flex-col p-8 glass-card transition-all duration-300 ${popular ? 'border-primary/50 bg-primary/[0.03] shadow-[0_0_60px_-15px_rgba(124,58,237,0.3)] scale-105 z-10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
           <Badge className="bg-primary hover:bg-primary text-white border-0 px-4 py-1.5 text-sm shadow-lg shadow-primary/40">Mais Popular</Badge>
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-5xl font-bold text-white tracking-tight">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
      </div>
      <div className="flex-1 mb-8">
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm font-medium">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${popular ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link href="/auth/signin" className="w-full">
        <Button className={`w-full h-14 rounded-xl text-base font-bold transition-all duration-300 ${popular ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
          {buttonText}
        </Button>
      </Link>
    </Card>
  )
}
