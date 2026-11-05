import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"
import { generateTrainingPlan, generateCommunicationTips } from "../../../../lib/huggingface"

export async function GET(req: Request, context: { params: Promise<{ userId: string }> }) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId } = params

    // Check if the user is authorized to view these recommendations
    if (
      session.user.id !== userId &&
      session.user.role !== "SUPERADMIN" &&
      (session.user.role !== "HR" || !session.user.organizationId)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // If HR, check if the requested user belongs to their organization
    if (session.user.role === "HR") {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!user || user.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Get the latest result
    const result = await prisma.result.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!result) {
      return NextResponse.json({ error: "No assessment results found" }, { status: 404 })
    }

    // Generate training recommendations
    const trainingRecommendations = await generateTrainingPlan({
      dScore: result.dScore,
      iScore: result.iScore,
      sScore: result.sScore,
      cScore: result.cScore,
      dominantType: result.dominantType,
    })

    // Generate communication tips
    const communicationTips = await generateCommunicationTips({
      dScore: result.dScore,
      iScore: result.iScore,
      sScore: result.sScore,
      cScore: result.cScore,
      dominantType: result.dominantType,
    })

    return NextResponse.json({
      trainingRecommendations,
      communicationTips,
    })
  } catch (error) {
    console.error("Training recommendations fetch error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
