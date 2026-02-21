"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutGrid, CreditCard, LifeBuoy, Hash, Globe, Ghost, Gamepad2, Search, Lock } from "lucide-react"
import { useSession } from "next-auth/react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => pathname === path

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-6 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-4 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Menu
          </h2>
          <div className="space-y-1">
            <SidebarItem href="/dashboard" icon={<LayoutGrid className="mr-2 h-4 w-4" />} label="Painel" active={isActive("/dashboard")} />
            <SidebarItem href="/dashboard/checker" icon={<Search className="mr-2 h-4 w-4" />} label="Verificador" active={isActive("/dashboard/checker")} />
            <SidebarItem href="/dashboard/subscription" icon={<CreditCard className="mr-2 h-4 w-4" />} label="Assinatura" active={isActive("/dashboard/subscription")} />
            <SidebarItem href="/dashboard/support" icon={<LifeBuoy className="mr-2 h-4 w-4" />} label="Suporte" active={isActive("/dashboard/support")} />
            {session?.user?.role === "ADMIN" && (
              <SidebarItem href="/dashboard/admin" icon={<Lock className="mr-2 h-4 w-4 text-red-500" />} label="Admin" active={isActive("/dashboard/admin")} />
            )}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-4 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Categorias
          </h2>
          <div className="space-y-1">
            <SidebarItem href="/dashboard/category/chars_2" icon={<Hash className="mr-2 h-4 w-4" />} label="2 Caracteres" active={isActive("/dashboard/category/chars_2")} />
            <SidebarItem href="/dashboard/category/chars_3" icon={<Hash className="mr-2 h-4 w-4" />} label="3 Caracteres" active={isActive("/dashboard/category/chars_3")} />
            <SidebarItem href="/dashboard/category/chars_4" icon={<Hash className="mr-2 h-4 w-4" />} label="4 Caracteres" active={isActive("/dashboard/category/chars_4")} />
            <SidebarItem href="/dashboard/category/pt_br" icon={<Globe className="mr-2 h-4 w-4" />} label="Palavras PT-BR" active={isActive("/dashboard/category/pt_br")} />
            <SidebarItem href="/dashboard/category/en_us" icon={<Globe className="mr-2 h-4 w-4" />} label="Palavras EN-US" active={isActive("/dashboard/category/en_us")} />
            <SidebarItem href="/dashboard/category/random" icon={<Ghost className="mr-2 h-4 w-4" />} label="Aleatórios" active={isActive("/dashboard/category/random")} />
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
