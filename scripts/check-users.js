const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ 
    select: { 
      id: true, 
      discordId: true, 
      email: true, 
      role: true, 
      subscriptionStatus: true 
    } 
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
