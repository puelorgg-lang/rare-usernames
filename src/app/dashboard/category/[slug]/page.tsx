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
    page?: string
    limit?: string
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
  
  // Pagination settings - default to 100, allow user to change
  const DEFAULT_LIMIT = 100
  const limit = Math.min(parseInt(searchParams.limit || String(DEFAULT_LIMIT), 10), 100)
  const page = Math.max(parseInt(searchParams.page || "1", 10), 1)
  const skip = (page - 1) * limit

  // Get total count for pagination info
  const totalCount = await prisma.username.count({
    where: {
      category: categoryEnum,
      ...(platform && { platform: platform }),
    },
  })

  const usernames = await prisma.username.findMany({
    where: {
      category: categoryEnum,
      ...(platform && { platform: platform }),
    },
    orderBy: {
      foundAt: "desc",
    },
    take: limit,
    skip: skip,
  })

  return (
    <div className="space-y-6">
      <UsernameTable 
        usernames={usernames} 
        category={params.slug} 
        totalCount={totalCount}
        currentPage={page}
        currentLimit={limit}
      />
      <div className="flex items-center justify-end">
        <AutoRefresh />
      </div>
    </div>
  )
}
