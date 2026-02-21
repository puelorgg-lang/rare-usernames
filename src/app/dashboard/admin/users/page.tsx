
import { PrismaClient } from "@prisma/client"
import { UserTable } from "@/components/dashboard/user-table"

const prisma = new PrismaClient()

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Gerenciar Usuários</h2>
        <p className="text-muted-foreground mt-2">
          Visualize e altere o status dos usuários.
        </p>
      </div>

      <UserTable users={users} />
    </div>
  )
}
