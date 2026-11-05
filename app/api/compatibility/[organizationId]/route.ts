import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    { error: "Team compatibility based on personality assessment has been removed." },
    { status: 410 },
  )
}
