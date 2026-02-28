"use client"

import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface PlatformButtonProps {
  src?: string
  alt?: string
  label: string
  delay?: number
  icon?: React.ReactNode
}

export function PlatformButton({ src, alt, label, delay = 0, icon }: PlatformButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleClick = () => {
    if (status === "loading") return
    
    if (!session) {
      // Not logged in, go to pricing
      router.push("/dashboard/subscription")
      return
    }

    // Check subscription status
    const subscriptionStatus = (session.user as any).subscriptionStatus
    if (subscriptionStatus === "ACTIVE") {
      router.push("/dashboard")
    } else {
      router.push("/dashboard/subscription")
    }
  }

  return (
    <div 
      className="flex items-center gap-2 animate-pulse group hover:translate-x-2 transition-transform duration-300 cursor-pointer"
      style={{ animationDuration: '2s', animationDelay: `${delay}s` }}
      onClick={handleClick}
    >
      <div className="w-16 h-16 rounded-full bg-black border-2 border-white flex items-center justify-center hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all backdrop-blur-sm relative">
        {icon ? icon : <Image src={src!} alt={alt!} width={40} height={40} className="object-contain" />}
        <span className="absolute left-full ml-3 px-3 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white">{label}</span>
      </div>
    </div>
  )
}
