import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../../lib/auth"
import { prisma } from "../../../../../../lib/db"
import type { NextRequest } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { qrCode } = await req.json()
    const { id: eventId } = await params

    if (!qrCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    // Find the QR code record
    const qrCodeRecord = await prisma.eventQRCode.findUnique({
      where: { code: qrCode },
      include: { event: true },
    })

    if (!qrCodeRecord) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    if (qrCodeRecord.eventId !== eventId) {
      return NextResponse.json({ error: "QR code does not match this event" }, { status: 400 })
    }

    // Check if user is registered for the event
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: "User not registered for this event" }, { status: 400 })
    }

    // Mark attendance
    const attendance = await prisma.eventAttendance.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
      update: {
        status: "ATTENDED",
        checkInTime: new Date(),
        scannedAt: new Date(),
        scannerUserId: session.user.id, // Self-scanned
      },
      create: {
        eventId,
        userId: session.user.id,
        status: "ATTENDED",
        checkInTime: new Date(),
        scannedAt: new Date(),
        scannerUserId: session.user.id,
      },
    })

    // Update QR code scan count
    await prisma.eventQRCode.update({
      where: { code: qrCode },
      data: {
        totalScans: {
          increment: 1,
        },
      },
    })

    // Update user event stats
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizationId: true },
    })

    if (event) {
      await prisma.userEventStats.upsert({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: event.organizationId,
          },
        },
        update: {
          totalAttended: {
            increment: 1,
          },
        },
        create: {
          userId: session.user.id,
          organizationId: event.organizationId,
          totalAttended: 1,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
      attendance,
    })
  } catch (error) {
    console.error("Error scanning QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}