"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutGrid, CreditCard, LifeBuoy, Hash, Globe, Ghost, Gamepad2, Lock, UserSearch, Rss, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isPremium, setIsPremium] = useState(false)

  // Check subscription status
  useEffect(() => {
    async function checkPremium() {
      try {
        const res = await fetch('/api/subscription/status')
        const data = await res.json()
        setIsPremium(data.isPremium || false)
      } catch {
        setIsPremium(false)
      }
    }
    if (session?.user) {
      checkPremium()
    }
  }, [session])

  const isActive = (path: string) => pathname === path

  // Premium categories to hide for free users
  const premiumCategories = [
    { href: "/dashboard/category/chars_2", icon: <Hash className="mr-2 h-4 w-4" />, label: "2 Caracteres" },
    { href: "/dashboard/category/chars_3", icon: <Hash className="mr-2 h-4 w-4" />, label: "3 Caracteres" },
    { href: "/dashboard/category/chars_4", icon: <Hash className="mr-2 h-4 w-4" />, label: "4 Caracteres" },
    { href: "/dashboard/category/pt_br", icon: <Globe className="mr-2 h-4 w-4" />, label: "Palavras PT-BR" },
    { href: "/dashboard/category/en_us", icon: <Globe className="mr-2 h-4 w-4" />, label: "Palavras EN-US" },
    { href: "/dashboard/category/random", icon: <Ghost className="mr-2 h-4 w-4" />, label: "Aleatórios" },
  ]

  // Free categories
  const freeCategories = [
    { href: "/dashboard/category/feed", icon: <Rss className="mr-2 h-4 w-4" />, label: "Feed" },
    { href: "/dashboard/category/4c", icon: <Hash className="mr-2 h-4 w-4" />, label: "4C" },
    { href: "/dashboard/category/pt_br_2", icon: <Globe className="mr-2 h-4 w-4" />, label: "PT-BR" },
    { href: "/dashboard/category/ponctuated", icon: <Hash className="mr-2 h-4 w-4" />, label: "Ponctuated" },
    { href: "/dashboard/category/en_us_2", icon: <Globe className="mr-2 h-4 w-4" />, label: "EN-US" },
    { href: "/dashboard/category/repeaters", icon: <Hash className="mr-2 h-4 w-4" />, label: "Repeaters" },
    { href: "/dashboard/category/face", icon: <Hash className="mr-2 h-4 w-4" />, label: "FACE" },
    { href: "/dashboard/category/4l", icon: <Hash className="mr-2 h-4 w-4" />, label: "4L" },
    { href: "/dashboard/category/3c", icon: <Hash className="mr-2 h-4 w-4" />, label: "3C" },
    { href: "/dashboard/category/4n", icon: <Hash className="mr-2 h-4 w-4" />, label: "4N" },
    { href: "/dashboard/category/3l", icon: <Hash className="mr-2 h-4 w-4" />, label: "3L" },
  ]

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-6 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-4 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Menu
          </h2>
          <div className="space-y-1">
            <SidebarItem href="/dashboard" icon={<LayoutGrid className="mr-2 h-4 w-4" />} label="Painel" active={isActive("/dashboard")} />
            <SidebarItem href="/dashboard/subscription" icon={<CreditCard className="mr-2 h-4 w-4" />} label="Assinatura" active={isActive("/dashboard/subscription")} />
            <SidebarItem href="/dashboard/support" icon={<LifeBuoy className="mr-2 h-4 w-4" />} label="Suporte" active={isActive("/dashboard/support")} />
            {session?.user?.role === "ADMIN" && (
              <>
                <SidebarItem href="/dashboard/admin/support" icon={<LifeBuoy className="mr-2 h-4 w-4 text-green-500" />} label="Gerenciar Suporte" active={isActive("/dashboard/admin/support")} />
                <SidebarItem href="/dashboard/admin" icon={<Lock className="mr-2 h-4 w-4 text-red-500" />} label="Admin" active={isActive("/dashboard/admin")} />
              </>
            )}
            {session?.user?.role === "SUPPORT" && (
              <SidebarItem href="/dashboard/support/chat" icon={<LifeBuoy className="mr-2 h-4 w-4 text-green-500" />} label="Chat Suporte" active={isActive("/dashboard/support/chat")} />
            )}
          </div>
        </div>
        
        {/* Premium Categories - Only show for premium users */}
        {isPremium && (
          <div className="px-3 py-2">
            <h2 className="mb-4 px-4 text-xs font-semibold tracking-wider text-yellow-500 uppercase flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Premium
            </h2>
            <div className="space-y-1">
              {premiumCategories.map((cat) => (
                <SidebarItem key={cat.href} href={cat.href} icon={cat.icon} label={cat.label} active={isActive(cat.href)} />
              ))}
            </div>
          </div>
        )}
        
        <div className="px-3 py-2">
          <h2 className="mb-4 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Categorias
          </h2>
          <div className="space-y-1">
            {freeCategories.map((cat) => (
              <SidebarItem key={cat.href} href={cat.href} icon={cat.icon} label={cat.label} active={isActive(cat.href)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link href={href}>
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start h-10 mb-1",
          active 
            ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" 
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
      >
        {icon}
        {label}
      </Button>
    </Link>
  )
}
