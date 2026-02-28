"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  session: boolean
}

export function Navbar({ session }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 z-50 w-full border-b border-white/5 bg-[#0b0b0d]/80 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "h-14 py-2" : "h-20 py-4"
      }`}
    >
      <div className={`container flex items-center justify-between transition-all duration-300 ${scrolled ? "h-10" : "h-16"}`}>
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="font-bold">Users4U</span>
        </div>
        
        <nav className={`hidden md:flex gap-6 text-sm font-medium text-muted-foreground transition-all duration-300 ${scrolled ? "text-xs gap-4" : "text-sm gap-8"}`}>
          <Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Preços</Link>
          <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button 
                className={`bg-primary hover:bg-primary/90 text-black rounded-full shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] ${
                  scrolled ? "px-4 h-8 text-xs" : "px-6 h-10"
                }`}
              >
                Ir para Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signin">
              <Button 
                className={`bg-primary hover:bg-primary/90 text-black rounded-full shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] ${
                  scrolled ? "px-4 h-8 text-xs" : "px-6 h-10"
                }`}
              >
                Entrar com Discord
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
