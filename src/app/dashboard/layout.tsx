import { Sidebar } from "@/components/dashboard/sidebar"
import { UserNav } from "@/components/dashboard/user-nav"
import { Shield } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-8">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <img src="/logo.png" alt="Users4U Logo" className="object-cover w-full h-full" />
            </div>
            <span>Users4U</span>
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
          <aside className="-mx-4 lg:w-48 flex-shrink-0">
            <Sidebar />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
