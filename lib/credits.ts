import { prisma } from "./db";

/**
 * Update member tactical credits after mission approval.
 */
export async function updateMemberCredits(
  userId: string,
  organizationId: string,
  credits: number,
  reason: string
) {
  try {
    // Get or create member credit record
    const memberCredit = await prisma.memberCredit.upsert({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      create: {
        userId,
        organizationId,
        totalCredits: credits,
        creditsJson: JSON.stringify([
          {
            amount: credits,
            reason,
            timestamp: new Date().toISOString(),
          },
        ]),
        tasksApproved: 1,
        approvalRate: 100,
      },
      update: {
        totalCredits: {
          increment: credits,
        },
        tasksApproved: {
          increment: 1,
        },
      },
    });

    return memberCredit;
  } catch (error) {
    console.error("[CREDIT_LEDGER_ERROR] Failed to update asset credits:", error);
    return null;
  }
}
