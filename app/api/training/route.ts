import { NextResponse } from "next/server"

/** Training recommendations deferred — not part of v1 youth club launch. */
export async function GET() {
  return NextResponse.json({ recommendations: [], deferred: true })
}

export async function POST() {
  return NextResponse.json(
    { error: "Training recommendations are not available in this version." },
    { status: 501 },
  )
}
