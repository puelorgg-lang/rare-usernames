import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, Zap, Globe, Lock, ArrowRight, Shield, Star, Rocket, User, Sparkles, Gamepad2, Music, MessageCircle } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Typewriter } from "@/components/typewriter"
import { Navbar } from "@/components/navbar"
import { PlatformButton } from "@/components/platform-button"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen flex-col bg-black overflow-hidden selection:bg-primary/30 text-white">
      <Navbar session={!!session} />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="container relative py-12 md:py-16 flex flex-col items-center text-center space-y-6">
          
          {/* Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase animate-in fade-in slide-in-from-bottom-8 duration-700">
            Garanta seus usernames
          </h1>

          {/* Video with icons overlay */}
          <div className="w-full max-w-lg mx-auto relative">
            {/* Left side icons - overlaid on video - alternating */}
            <div className="hidden md:flex flex-col gap-3 absolute -left-16 top-1/2 -translate-y-1/2 z-10">
              <PlatformButton src="/discord-icon.png" alt="Discord" label="Discord: 40,000 Users" delay={0} />
              <PlatformButton src="/minecraft-new.png" alt="Minecraft" label="Minecraft: 12,340 Users" delay={0.3} />
              <PlatformButton src="/roblox-icon.png" alt="Roblox" label="Roblox: 32,345 Users" delay={0.6} />
            </div>

            {/* Video */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <video
                src="/videomain1.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Right side icons - overlaid on video - alternating */}
            <div className="hidden md:flex flex-col gap-3 absolute -right-16 top-1/2 -translate-y-1/2 z-10">
              <PlatformButton src="/instagram-icon.png" alt="Instagram" label="Instagram: 1,324 Users" delay={0.2} />
              <div className="flex items-center gap-2 animate-pulse -translate-x-1 group hover:-translate-x-2 transition-transform duration-300" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
                <div className="w-16 h-16 rounded-full bg-black border-2 border-white flex items-center justify-center hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all backdrop-blur-sm relative">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span className="absolute right-full mr-3 px-3 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white">Tiktok: 4,543 Users</span>
                </div>
              </div>
              <PlatformButton src="/twitter-icon.png" alt="Twitter" label="Twitter: 234 Users" delay={0.8} />
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <Typewriter text="Pare de adivinhar. Nosso sistema avançado monitora Discord, Minecraft e Roblox 24/7, notificando você no segundo em que ficam disponíveis." speed={40} />
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 text-black">
                  Acessar Painel <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 text-black">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-6 pt-8 opacity-80 animate-in fade-in duration-1000 delay-200">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-white">50k+</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monitorados</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-white">1.2s</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intervalo</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-white">99%</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa de Sucesso</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uptime</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 space-y-16">
          <ScrollReveal>
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Funcionalidades Poderosas</h2>
              <p className="text-muted-foreground text-lg md:text-xl">
                Tudo o que você precisa para garantir o nome OG que sempre quis.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0}>
              <FeatureCard 
                icon={<Zap className="h-6 w-6 text-yellow-400" />}
                title="Velocidade Relâmpago"
                description="Nosso motor de sniper personalizado verifica a disponibilidade mais rápido do que qualquer humano poderia."
              />
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <FeatureCard 
                icon={<Globe className="h-6 w-6 text-blue-400" />}
                title="Multi-Plataforma"
                description="Uma assinatura cobre Discord, Minecraft, Roblox e as principais redes sociais."
              />
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <FeatureCard 
                icon={<Lock className="h-6 w-6 text-green-400" />}
                title="Seguro e Privado"
                description="Seus dados são criptografados. Nunca compartilhamos sua lista de alvos com outros usuários."
              />
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <FeatureCard 
                icon={<Rocket className="h-6 w-6 text-white" />}
                title="Auto-Claimer"
                description="Não apenas assista. Configure nosso bot para tentar reivindicar o nome automaticamente para você."
              />
            </ScrollReveal>
            <ScrollReveal delay={400}>
              <FeatureCard 
                icon={<Star className="h-6 w-6 text-orange-400" />}
                title="Pontuação de Raridade"
                description="Nossa IA analisa nomes para fornecer uma pontuação de raridade baseada em comprimento, significado e demanda."
              />
            </ScrollReveal>
            <ScrollReveal delay={500}>
              <FeatureCard 
                icon={<Shield className="h-6 w-6 text-red-400" />}
                title="Proteção Contra Ban"
                description="Limitação inteligente de taxa garante que suas contas permaneçam seguras enquanto fazemos o trabalho pesado."
              />
            </ScrollReveal>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-24 space-y-16 relative">
          <ScrollReveal>
            <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10 rounded-full"></div>
            
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Preços Simples e Transparentes</h2>
              <p className="text-muted-foreground text-lg md:text-xl">Comece de graça, atualize para mais poder.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            <ScrollReveal delay={0}>
              <PricingCard 
                title="Iniciante"
                price="R$5"
                period="/dia"
                features={["Acesso 24h", "Monitoramento Básico", "Apenas Discord", "Reivindicação Manual"]}
                buttonText="Comprar Passe Diário"
              />
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <PricingCard 
                title="Pro"
                price="R$16"
                period="/semana"
                popular
                features={["Acesso 7 Dias", "Todas as Plataformas", "Velocidade Prioritária", "Auto-Claimer (Beta)", "Ferramentas Sniper"]}
                buttonText="Comprar Passe Semanal"
              />
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <PricingCard 
                title="Elite"
                price="R$25"
                period="/mês"
                features={["Acesso 30 Dias", "Todas as Plataformas", "Notificações Instantâneas", "IP Dedicado", "Acesso à API Privada", "Suporte VIP 24/7"]}
                buttonText="Comprar Passe Mensal"
              />
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container py-24 max-w-3xl space-y-12">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">FAQ</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
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
          </ScrollReveal>
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
    <Card className={`relative flex flex-col p-8 glass-card transition-all duration-300 ${popular ? 'border-primary/50 bg-primary/[0.03] shadow-[0_0_60px_-15px_rgba(255,255,255,0.2)] scale-105 z-10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
           <Badge className="bg-primary hover:bg-primary text-black border-0 px-4 py-1.5 text-sm shadow-lg shadow-primary/40">Mais Popular</Badge>
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
      <Link href="https://discord.gg/x7d5g89kNe" target="_blank" className="w-full">
        <Button className={`w-full h-14 rounded-xl text-base font-bold transition-all duration-300 ${popular ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
          {buttonText}
        </Button>
      </Link>
    </Card>
  )
}
