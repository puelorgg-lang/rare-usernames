import { Navbar } from "@/components/navbar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function BuscarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-[#0b0b0d]">
      <Navbar session={!!session} />
      {children}
    </div>
  )
}
