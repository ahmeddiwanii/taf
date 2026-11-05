import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions, UserRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendRejectionEmail } from "@/lib/email"
import { dispatchNotification } from "@/lib/notifications"
import { getMemberStatus, setMemberStatus } from "@/lib/member-status-db"

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== UserRole.SUPERADMIN && session.user.role !== UserRole.HR)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await context.params
    const { decision } = await req.json()

    if (!["ACCEPTED", "REJECTED"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 })
    }

    const member = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, organizationId: true, email: true, name: true },
    })

    if (!member || member.role !== "MEMBER") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // HR can only decide for members in their organization
    if (session.user.role === UserRole.HR) {
      if (!session.user.organizationId || member.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    await setMemberStatus(id, decision)

    if (decision === "REJECTED") {
      try {
        await sendRejectionEmail({ to: member.email })
      } catch (e) {
        // still succeed decision; email failure is secondary
        console.error("[HR_DECISION] Failed to send rejection email:", e)
      }
    }

    await dispatchNotification({
      userId: member.id,
      type: decision === "ACCEPTED" ? "HR_ACCEPTED" : "HR_REJECTED",
      title: decision === "ACCEPTED" ? "Access granted" : "Update",
      message:
        decision === "ACCEPTED"
          ? "You have been accepted. Please complete your profile to continue."
          : "You were not accepted. Please check your email for details.",
      actionUrl: decision === "ACCEPTED" ? "/dashboard/member/profile" : "/auth/login?message=rejected",
    })

    const memberStatus = await getMemberStatus(id)
    return NextResponse.json({ success: true, memberStatus })
  } catch (error) {
    console.error("[HR_DECISION] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

