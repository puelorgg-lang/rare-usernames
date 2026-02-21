
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'guilhermemeneses121@gmail.com'
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { 
        role: 'ADMIN',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: 'PRO_HUNTER' 
      },
    })
    console.log(`User ${email} promoted to ADMIN:`, user)
  } catch (error) {
    console.error(`Error updating user ${email}:`, error)
    // Attempt to find user to see if they exist
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('User found:', user)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
