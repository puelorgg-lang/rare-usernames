import { UsernameTable } from "@/components/dashboard/username-table"
import prisma from "@/lib/prisma"
import { Category, CATEGORIES } from "@/lib/constants"
import { redirect } from "next/navigation"
import { AutoRefresh } from "@/components/dashboard/auto-refresh"

// Força atualização a cada requisição
export const dynamic = 'force-dynamic'

// Map dashboard slugs to category values in database
const SLUG_TO_CATEGORY_MAP: Record<string, string> = {
  // Premium original
  'chars_2': 'CHARS_2',
  'chars_3': 'CHARS_3',
  'chars_4': 'CHARS_4',
  'pt_br': 'PT_BR',
  'en_us': 'EN_US',
  'random': 'RANDOM',
  // Free
  'feed': 'FEED',
  // New Premium channels
  '4c': '4C',
  'pt_br_2': 'PT_BR_2',
  'ponctuated': 'PONCTUATED',
  'en_us_2': 'EN_US_2',
  'repeaters': 'REPEATERS',
  'face': 'FACE',
  '4l': '4L',
  '3c': '3C',
  '4n': '4N',
  '3l': '3L',
}

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
  const slug = params.slug.toLowerCase()
  
  // Get the category from slug or use the slug directly if it's a valid category
  const category = SLUG_TO_CATEGORY_MAP[slug] || slug.toUpperCase()
  
  // Validate if category is a valid category
  const validCategories = [...Object.values(CATEGORIES), '4C', 'PT_BR_2', 'PONCTUATED', 'EN_US_2', 'REPEATERS', 'FACE', '4L', '3C', '4N', '3L']
  if (!validCategories.includes(category)) {
    redirect("/dashboard")
  }

  const platform = searchParams.platform || undefined
  
  // Pagination settings - default to 100, allow user to change
  const DEFAULT_LIMIT = 100
  const limit = Math.min(parseInt(searchParams.limit || String(DEFAULT_LIMIT), 10), 100)
  const page = Math.max(parseInt(searchParams.page || "1", 10), 1)
  const skip = (page - 1) * limit

  // Get total count for pagination info
  const totalCount = await prisma.username.count({
    where: {
      category: category,
      ...(platform && { platform: platform }),
    },
  })

  const usernames = await prisma.username.findMany({
    where: {
      category: category,
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
