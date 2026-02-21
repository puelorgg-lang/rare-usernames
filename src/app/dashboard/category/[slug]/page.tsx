import { UsernameTable } from "@/components/dashboard/username-table"
import prisma from "@/lib/prisma"
import { Category, CATEGORIES } from "@/lib/constants"
import { redirect } from "next/navigation"
import { AutoRefresh } from "@/components/dashboard/auto-refresh"

// Força atualização a cada requisição
export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    platform?: string
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const slugUpper = params.slug.toUpperCase()
  
  // Validate if slug is a valid category
  if (!Object.keys(CATEGORIES).includes(slugUpper)) {
    redirect("/dashboard")
  }

  const categoryEnum = slugUpper as Category

  const platform = searchParams.platform || undefined

  const usernames = await prisma.username.findMany({
    where: {
      category: categoryEnum,
      ...(platform && { platform: platform }),
    },
    orderBy: {
      foundAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <UsernameTable usernames={usernames} category={params.slug} />
      <div className="flex items-center justify-end">
        <AutoRefresh />
      </div>
    </div>
  )
}
