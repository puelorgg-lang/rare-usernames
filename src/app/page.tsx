import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, Zap, Globe, Lock, ArrowRight, Shield, Star, Rocket, User, Sparkles, Gamepad2, Music, MessageCircle } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ScrollReveal } from "@/components/scroll-reveal"

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

          {/* Supported Platforms - App Icons */}
          <div className="flex flex-col items-center pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-6">Plataformas suportadas</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {/* Discord */}
              <div className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_-5px_rgba(88,101,242,0.5)] hover:bg-[#5865F2]/30">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Discord</span>
              </div>

              {/* Minecraft */}
              <div className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#8FCDA8]/20 border border-[#8FCDA8]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_-5px_rgba(143,205,168,0.5)] hover:bg-[#8FCDA8]/30">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" fill="#8FCDA8">
                    <path d="M18.7 3.1c-.6-.3-1.3-.4-2-.2l-1.1.3c-.7.2-1.3.7-1.6 1.4l-.7 1.4c-.4.7-.6 1.5-.6 2.3v6.9c0 1.1.4 2.1 1 2.9l-2.6 2.6c-.5-.3-1.1-.5-1.7-.5-1.2 0-2.3.8-2.8 1.9-.5-1.2-1.6-1.9-2.8-1.9-.6 0-1.2.2-1.7.5L2.7 17.9c.7-.9 1.7-1.5 2.8-1.5.8 0 1.6.3 2.2.7l1.3 1c.5.4 1.1.6 1.7.6 1.2 0 2.2-.9 2.4-2.1l.3-1.6c.1-.6.4-1.2.8-1.7l1-1.2c.3-.4.5-.9.5-1.4V5.7c0-.8-.3-1.6-.8-2.2l.7-.4zm-1.5 1.4c.2 0 .4.1.5.2l1.1 1.1c.2.2.3.5.3.8v5.9l-1.4 1.4c-.1.1-.2.1-.4.1-.6 0-1.1-.5-1.1-1.1V8.1l.7-.7c.2-.2.5-.3.8-.3l-.5-3.6zm-6.2.5c.2 0 .4.1.5.2l1.1 1.1c.2.2.3.5.3.8v5.9l-1.4 1.4c-.1.1-.2.1-.4.1-.6 0-1.1-.5-1.1-1.1V8.1l.7-.7c.2-.2.5-.3.8-.3l-.5-3.6zm-5.4 3.7l.6.5c.2.2.3.4.3.7v5.3c0 .6-.5 1.1-1.1 1.1-.2 0-.4-.1-.5-.2l-1-1.1V9.4l1.7-1.7zm10.3 8.3c0 .2-.1.3-.2.5l-.7.7c-.2.2-.4.3-.7.3-.5 0-1-.4-1-1V7.8l2.6-2.6c.2-.2.5-.2.8 0l1.8 1.8c.2.2.2.5 0 .8l-2.6 2.6v5.1z"/>
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Minecraft</span>
              </div>

              {/* Roblox */}
              <div className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#FFFFFF]/20 border border-[#FFFFFF]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] hover:bg-[#FFFFFF]/30">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" fill="#FFFFFF">
                    <path d="M12.08 1.5c-.73 0-1.42.19-2.03.53L4.49 4.62c-.93.36-1.58 1.22-1.77 2.22L1.44 10.5c-.1.53.12 1.08.56 1.42l3.37 2.56c.37.28.84.37 1.28.23l3.2-1.04c.37-.12.75-.12 1.12 0l3.2 1.04c.44.14.91.05 1.28-.23l3.37-2.56c.44-.34.66-.89.56-1.42l-1.28-3.66c-.19-1-.84-1.86-1.77-2.22l-5.56-2.59c-.61-.34-1.3-.53-2.03-.53h-.08zM8.5 7.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Roblox</span>
              </div>

              {/* Instagram */}
              <div className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#833AB4]/20 via-[#FD1D1D]/20 to-[#F77737]/20 border border-[#E1306C]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_-5px_rgba(225,48,108,0.5)] hover:bg-gradient-to-br hover:from-[#833AB4]/30 hover:via-[#FD1D1D]/30 hover:to-[#F77737]/30">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" fill="url(#insta-gradient)">
                    <defs>
                      <linearGradient id="insta-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#833AB4"/>
                        <stop offset="50%" stopColor="#FD1D1D"/>
                        <stop offset="100%" stopColor="#F77737"/>
                      </linearGradient>
                    </defs>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Instagram</span>
              </div>

              {/* TikTok */}
              <div className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#000000]/40 border border-[#FFFFFF]/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:border-[#FF0050]/50">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" fill="white">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground font-medium">TikTok</span>
              </div>

              {/* YouTube */}
              <div className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#FF0000]/20 border border-[#FF0000]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_-5px_rgba(255,0,0,0.5)] hover:bg-[#FF0000]/30">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground font-medium">YouTube</span>
              </div>
            </div>
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
                icon={<Rocket className="h-6 w-6 text-purple-400" />}
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
