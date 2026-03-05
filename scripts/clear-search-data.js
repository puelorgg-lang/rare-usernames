const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSearchData() {
  try {
    console.log('🧹 Starting to clear search data...\n');

    // Clear all tables
    const results = await Promise.all([
      prisma.searchLog.deleteMany({}),
      prisma.userSearch.deleteMany({}),
      prisma.avatarHistory.deleteMany({}),
      prisma.bannerHistory.deleteMany({})
    ]);

    console.log('✅ Search data cleared successfully!');
    console.log('\n📊 Deleted records:');
    console.log(`   - SearchLog: ${results[0].count} records`);
    console.log(`   - UserSearch: ${results[1].count} records`);
    console.log(`   - AvatarHistory: ${results[2].count} records`);
    console.log(`   - BannerHistory: ${results[3].count} records`);

  } catch (error) {
    console.error('❌ Error clearing search data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSearchData();
