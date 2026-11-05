"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MemberSidebar } from "@/components/layout/member-sidebar"
import { MemberTopNav } from "@/components/layout/member-top-navbar"
import { OnboardingTour } from "@/components/onboarding-tour"

interface MemberLayoutProps {
  children: React.ReactNode
  orgName?: string
}

export default function MemberLayout({ children, orgName = "Organization" }: MemberLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [displayOrg, setDisplayOrg] = useState(orgName)
  const { status } = useSession()

  useEffect(() => {
    setDisplayOrg(orgName)
  }, [orgName])

  useEffect(() => {
    if (status !== "authenticated") return
    let cancelled = false
    fetch("/api/dashboard/member/profile-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.organization?.name) setDisplayOrg(data.organization.name)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [status])

  return (
    <div className="min-h-screen bg-jasmine text-soot selection:bg-pomegranate/30">
      <OnboardingTour role="member" />
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#e85d4c]/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-[#2a9d8f]/8 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-[#6b8f71]/8 blur-[100px] rounded-full" />
      </div>

      <MemberSidebar 
        organizationName={displayOrg} 
        isOpen={isSidebarOpen} 
        setIsOpenAction={setIsSidebarOpen} 
      />
      
      <main className="md:ml-64 min-h-screen relative z-10 flex flex-col">
        <MemberTopNav 
          organizationName={displayOrg} 
          onMenuAction={() => setIsSidebarOpen(true)} 
        />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

