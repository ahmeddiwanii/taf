import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../../../lib/auth"
import { prisma } from "../../../../../../lib/db"

export async function DELETE(_: Request, context: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const team = await prisma.team.findUnique({ where: { id }, select: { organizationId: true } })
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== team.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  await prisma.teamMember.deleteMany({
    where: { teamId: id, userId },
  })

  return NextResponse.json({ success: true })
}


