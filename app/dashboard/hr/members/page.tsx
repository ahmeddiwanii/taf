"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { UserRole } from "../../../../types/user"
import { HRLayout } from "../../../../components/layout/hr-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Badge } from "../../../../components/ui/badge"
import { Search, Users, CheckCircle, Clock, Mail, Eye, Bell } from "lucide-react"
import type { MemberData } from "../../../../lib/types"

export default function MembersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [members, setMembers] = useState<MemberData[]>([])
  const [filteredMembers, setFilteredMembers] = useState<MemberData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "completed" | "pending">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }

    if (status === "authenticated" && session.user.role === "HR" && session.user.organizationId) {
      fetchMembers()
    }
  }, [status, router, session])

  useEffect(() => {
    let filtered = members

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (member) => member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((member) =>
        filterType === "completed" ? member.testCompleted : !member.testCompleted,
      )
    }

    setFilteredMembers(filtered)
  }, [searchQuery, members, filterType])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/users?organizationId=${session?.user.organizationId}&role=MEMBER`)
      if (!response.ok) {
        throw new Error("Failed to fetch members")
      }
      const data = await response.json()

      const formattedMembers = data.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        dominantType: member.results[0]?.dominantType || null,
        testCompleted: member.results.length > 0,
        memberStatus: member.memberStatus,
      }))

      setMembers(formattedMembers)
      setFilteredMembers(formattedMembers)
      setIsLoading(false)
    } catch (error) {
      setError("Failed to load members. Please try again.")
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string | null) => {
    if (!type) return "bg-gray-500"
    switch (type) {
      case "D":
        return "bg-red-500 hover:bg-red-600"
      case "I":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "S":
        return "bg-green-500 hover:bg-green-600"
      case "C":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeDescription = (type: string | null) => {
    switch (type) {
      case "D":
        return "Dominant"
      case "I":
        return "Influencer"
      case "S":
        return "Steadiness"
      case "C":
        return "Conscientious"
      default:
        return "Not Available"
    }
  }

  const stats = {
    total: members.length,
    completed: members.filter((e) => e.testCompleted).length,
    pending: members.filter((e) => !e.testCompleted).length,
  }

  const getStatusPill = (e: MemberData) => {
    if (e.memberStatus === "REJECTED") return { label: "Rejected", cls: "bg-red-500/10 text-red-400 border-red-500/20" }
    if (e.memberStatus === "AWAITING_HR") return { label: "Awaiting bureau", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" }
    if (e.memberStatus === "TEST_PENDING") return { label: "Invited", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
    return { label: "Active", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
  }

  if (isLoading) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="flex justify-center items-center py-24">
          <div className="space-y-6 text-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 mx-auto shadow-[0_0_20px_rgba(59,130,246,0.2)]"></div>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Synchronizing Team Data...</p>
          </div>
        </div>
      </HRLayout>
    )
  }

  if (error) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </HRLayout>
    )
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a9d8f]/10 border border-[#2a9d8f]/20 mb-3">
              <Users className="w-3.5 h-3.5 text-[#2a9d8f]" />
              <span className="text-[10px] font-bold text-[#2a9d8f] uppercase tracking-widest">Club members</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Members
            </h1>
            <p className="text-sm text-white/40 mt-2 font-medium">Invite people, see who is active, and export your list.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                window.location.href = "/api/hr/members/export"
              }}
            >
              Export CSV
            </Button>
            <Button asChild className="bg-[#e85d4c] hover:bg-[#d54d3d] text-white font-bold gap-2 shadow-lg shadow-[#e85d4c]/20 rounded-xl border-0">
              <Link href="/dashboard/hr/members/invite">
                <Mail className="w-4 h-4" />
                Invite member
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatCard icon={Users} label="Total members" value={stats.total} sub="In your club" color="blue" />
          <StatCard icon={CheckCircle} label="Active" value={members.filter((e) => e.memberStatus === "ACCEPTED" || !e.memberStatus).length} sub="Ready to help" color="emerald" />
          <StatCard icon={Clock} label="Waiting" value={members.filter((e) => e.memberStatus === "AWAITING_HR").length} sub="Need bureau review" color="amber" />
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/[0.02] border border-white/[0.08] p-4 rounded-2xl backdrop-blur-md">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-white/[0.03] border-white/[0.1] text-white focus:bg-white/[0.08] focus:border-blue-500/50 h-12 rounded-xl transition-all"
            />
          </div>

          <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
            {(["all", "completed", "pending"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  filterType === filter 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="py-20 text-center bg-white/[0.01] border border-white/[0.06] rounded-3xl backdrop-blur-sm">
            <Users className="w-16 h-16 text-white/5 mx-auto mb-4" />
            <p className="text-lg font-bold text-white/40 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No Results Found</p>
            <p className="text-sm text-white/20 mt-1">Try broadening your search or filter settings.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="group relative bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-blue-500/10"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Badge
                    className={`${getStatusPill(member).cls} text-[10px] font-black uppercase tracking-widest border px-2 py-0.5`}
                  >
                    {getStatusPill(member).label}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="font-black text-xl text-white group-hover:text-blue-400 transition-colors tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {member.name}
                    </h3>
                    <p className="text-xs text-white/40 font-medium truncate mt-1 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> {member.email}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">DISC Type</span>
                      {member.dominantType ? (
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getTypeGlow(member.dominantType)} animate-pulse`} />
                          <span className="text-xs font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {getTypeDescription(member.dominantType)} ({member.dominantType})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-white/10 uppercase italic">Awaiting Results</span>
                      )}
                    </div>

                    <div className="pt-2">
                      {member.testCompleted ? (
                        <Button
                          className="w-full bg-white/5 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-500 font-bold rounded-xl gap-2 transition-all"
                          onClick={() => router.push(`/dashboard/hr/members/${member.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                          Examine Profile
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 font-bold rounded-xl gap-2 transition-all"
                          onClick={() => {
                            alert(`Notification dispatched to ${member.email}`)
                          }}
                        >
                          <Bell className="w-4 h-4" />
                          Send Alert
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HRLayout>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  const themes: any = {
    blue: { border: "border-blue-500/20", icon: "text-blue-400", bg: "bg-blue-600/5" },
    emerald: { border: "border-emerald-500/20", icon: "text-emerald-400", bg: "bg-emerald-600/5" },
    amber: { border: "border-amber-500/20", icon: "text-amber-400", bg: "bg-amber-600/5" },
  }
  const theme = themes[color]
  return (
    <Card className={`bg-white/[0.02] border ${theme.border} backdrop-blur-xl rounded-2xl`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-white mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
            <p className="text-[10px] text-white/20 mt-1 font-medium">{sub}</p>
          </div>
          <div className={`p-3 rounded-2xl ${theme.bg} border ${theme.border}`}>
            <Icon className={`w-6 h-6 ${theme.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getTypeGlow(type: string | null) {
  if (!type) return "bg-white/20"
  switch (type) {
    case "D": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
    case "I": return "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
    case "S": return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
    case "C": return "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
    default: return "bg-white/20"
  }
}
