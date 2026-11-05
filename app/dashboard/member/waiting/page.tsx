"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

import MemberLayout from "@/components/layout/member-layout"
import { Card } from "@/components/ui/card"

type MemberStatus = "TEST_PENDING" | "AWAITING_HR" | "ACCEPTED" | "REJECTED"

export default function MemberWaitingPage() {
  const router = useRouter()
  const [status, setStatus] = useState<MemberStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const res = await fetch("/api/dashboard/member/onboarding-status", { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    const nextStatus = data.memberStatus as MemberStatus
    // Legacy TEST_PENDING treated as active after DISC removal
    if (nextStatus === "TEST_PENDING" || nextStatus === "ACCEPTED") {
      router.replace(data.profileCompleted ? "/dashboard/member/home" : "/dashboard/member/profile")
      return
    }
    setStatus(nextStatus)

    if (nextStatus === "REJECTED") {
      await signOut({ callbackUrl: "/auth/login?message=rejected" })
    }
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!active) return
      setLoading(true)
      await refresh()
      if (!active) return
      setLoading(false)
    })()

    const t = setInterval(() => {
      refresh()
    }, 3500)

    return () => {
      active = false
      clearInterval(t)
    }
  }, [])

  return (
    <MemberLayout>
      <div className="mx-auto max-w-2xl py-10">
        <Card className="space-y-4 border-white/10 bg-[#0f1c2e] p-8 text-white">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            Almost there
          </h1>
          <p className="text-sm text-white/60">
            {loading
              ? "Checking your club status…"
              : status === "AWAITING_HR"
                ? "Your bureau is reviewing your membership. This page refreshes automatically."
                : "Syncing…"}
          </p>
        </Card>
      </div>
    </MemberLayout>
  )
}
