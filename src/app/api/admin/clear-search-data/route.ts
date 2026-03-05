import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Verify admin secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const secret = process.env.ADMIN_SECRET || 'admin-secret'
    
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('🧹 Clearing search-related data...')
    
    // Delete AvatarHistory
    const avatarCount = await prisma.avatarHistory.deleteMany()
    console.log(`✅ Deleted ${avatarCount.count} avatar history records`)
    
    // Delete BannerHistory
    const bannerCount = await prisma.bannerHistory.deleteMany()
    console.log(`✅ Deleted ${bannerCount.count} banner history records`)
    
    // Delete UserSearch
    const userSearchCount = await prisma.userSearch.deleteMany()
    console.log(`✅ Deleted ${userSearchCount.count} user search records`)
    
    // Delete SearchLog
    const searchLogCount = await prisma.searchLog.deleteMany()
    console.log(`✅ Deleted ${searchLogCount.count} search log records`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'All search data cleared successfully',
      deleted: {
        avatarHistory: avatarCount.count,
        bannerHistory: bannerCount.count,
        userSearch: userSearchCount.count,
        searchLog: searchLogCount.count
      }
    })
  } catch (error: any) {
    console.error('❌ Error clearing data:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
