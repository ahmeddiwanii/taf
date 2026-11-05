"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { UserRole } from "../../../../types/user"
import { HRLayout } from "@/components/layout/hr-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Search, 
  Users, 
  Plus, 
  Calendar, 
  Briefcase, 
  Eye, 
  Edit, 
  CheckCircle, 
  Trash2, 
  AlertCircle,
  MoreVertical,
  Target,
  Rocket,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Team {
  id: string
  name: string
  purpose?: string
  description?: string
  status: string
  eventId?: string
  projectId?: string
  members: any[]
  memberCount: number
  taskCount: number
  createdBy: string
}

interface Event {
  id: string
  title: string
  startAt: string
  endAt?: string
  description?: string
}

export default function TeamsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "event-based" | "independent">("all")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", purpose: "", type: "independent" })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }

    if (status === "authenticated" && session?.user.role === "HR") {
      fetchTeamsAndEvents()
    }
  }, [status, router, session])

  useEffect(() => {
    let filtered = teams

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((team) => team.name.toLowerCase().includes(query))
    }

    if (filterType === "event-based") {
      filtered = filtered.filter((team) => team.eventId)
    } else if (filterType === "independent") {
      filtered = filtered.filter((team) => !team.eventId)
    }

    if (selectedEvent && filterType !== "independent") {
      filtered = filtered.filter((team) => team.eventId === selectedEvent)
    }

    setFilteredTeams(filtered)
  }, [searchQuery, teams, filterType, selectedEvent])

  const fetchTeamsAndEvents = async () => {
    try {
      const [teamsRes, eventsRes] = await Promise.all([
        fetch(`/api/teams?organizationId=${session?.user.organizationId}`),
        fetch(`/api/events?organizationId=${session?.user.organizationId}`),
      ])

      if (!teamsRes.ok || !eventsRes.ok) throw new Error("Failed to fetch data")

      const teamsData = await teamsRes.json()
      const eventsResponse = await eventsRes.json()

      const teamsArray = teamsData?.teams || (Array.isArray(teamsData) ? teamsData : [])
      
      setTeams(teamsArray)
      setFilteredTeams(teamsArray)
      setEvents(eventsResponse?.events || [])
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load teams. Please try again.")
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete team")
      
      toast.success("Squad Devalidated")
      fetchTeamsAndEvents()
    } catch (error: any) {
      toast.error("Recall Failed")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEditTeam = (teamId: string) => {
    router.push(`/dashboard/hr/teams/${teamId}/edit`)
  }

  const handleManageTeam = (teamId: string) => {
    router.push(`/dashboard/hr/teams/${teamId}`)
  }

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return
    if (newTeam.type === "event-based" && !selectedEvent) return

    setIsCreating(true)
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeam.name,
          purpose: newTeam.purpose,
          organizationId: session?.user.organizationId,
          eventId: newTeam.type === "event-based" ? selectedEvent : null,
        }),
      })

      if (!res.ok) throw new Error("Failed to create team")

      setNewTeam({ name: "", purpose: "", type: "independent" })
      setShowCreateModal(false)
      setSelectedEvent(null)
      await fetchTeamsAndEvents()
    } catch (error) {
      alert("Error creating team")
    } finally {
      setIsCreating(false)
    }
  }

  const stats = {
    total: teams.length,
    eventBased: teams.filter((t) => t.eventId).length,
    independent: teams.filter((t) => !t.eventId).length,
    active: teams.filter((t) => t.status === "active").length,
  }

  if (isLoading) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="flex justify-center items-center py-24 relative z-10">
          <div className="space-y-4 text-center">
             <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
             <p className="text-white/40 font-bold tracking-widest uppercase text-xs">Syncing Command Center...</p>
          </div>
        </div>
      </HRLayout>
    )
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <div className="space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              TEAM <span className="text-blue-500">INTEL</span>
            </h1>
            <p className="text-white/40 font-medium tracking-wide">Configure operational squads and deployment units</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <Button
              onClick={() => router.push("/dashboard/hr/teams/orchestrator")}
              variant="outline"
              className="h-14 px-8 bg-white/5 hover:bg-white/10 text-white gap-3 rounded-2xl border-white/10 font-black transition-all"
            >
              <Zap className="w-5 h-5 text-blue-400" />
              SQUAD ORCHESTRATOR
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white gap-3 rounded-2xl shadow-xl shadow-blue-600/20 border border-blue-500/50 font-black transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              DEPLOY NEW SQUAD
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard icon={Users} label="TOTAL ASSETS" value={stats.total} color="blue" />
          <StatCard icon={Calendar} label="EVENT BASED" value={stats.eventBased} color="purple" />
          <StatCard icon={Briefcase} label="STANDALONE" value={stats.independent} color="emerald" />
          <StatCard icon={CheckCircle} label="OPERATIONAL" value={stats.active} color="amber" />
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
          <div className="lg:col-span-2 space-y-2">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Registry Search</p>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Locate squads in the database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-white rounded-2xl transition-all backdrop-blur-xl group-hover:bg-white/[0.05]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Deployment Type</p>
            <div className="flex p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl h-16 items-center">
              {(["all", "event-based", "independent"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setFilterType(filter); setSelectedEvent(null); }}
                  className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterType === filter 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-white/30 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {filter === "all" ? "Grid" : filter === "event-based" ? "Events" : "Direct"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Event Filter (Visible only when 'event-based' is selected) */}
        <AnimatePresence>
          {filterType === "event-based" && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className={`px-6 py-3 rounded-xl border text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedEvent === null 
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20" 
                  : "bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                All Events
              </button>
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`px-6 py-3 rounded-xl border text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 ${
                    selectedEvent === event.id 
                    ? "bg-blue-500/20 text-blue-400 border-blue-500 shadow-lg shadow-blue-500/10" 
                    : "bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {event.title}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teams Grid */}
        <AnimatePresence mode="wait">
          {filteredTeams.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-32 text-center bg-white/[0.02] border border-white/[0.08] rounded-[2rem] backdrop-blur-xl"
            >
                <Target className="w-20 h-20 text-white/5 mx-auto mb-6" />
                <p className="text-xl font-black text-white/40 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No Active Squads Detected</p>
                <p className="text-sm text-white/20 mt-2 mb-8 max-w-sm mx-auto">The operational grid is empty. Initialize your first team to begin assignment protocols.</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="h-12 px-8 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white font-bold rounded-xl transition-all"
                >
                  INITIALIZE SQUAD
                </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredTeams.map((team, index) => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  index={index} 
                  onManage={() => handleManageTeam(team.id)}
                  onEdit={() => handleEditTeam(team.id)}
                  onDelete={() => setIsDeleting(team.id)}
                  isActionMenuOpen={actionMenuId === team.id}
                  setActionMenuId={setActionMenuId}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a10] border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Rocket className="w-7 h-7 text-blue-400" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SQUAD INITIALIZATION</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-0.5">Define new operational parameters</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Team Designation</label>
                  <Input
                    placeholder="e.g., Strike Team Alpha"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="h-14 bg-white/5 border-white/10 text-white rounded-xl focus:border-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Mission Purpose</label>
                  <Input
                    placeholder="Brief description of objectives"
                    value={newTeam.purpose}
                    onChange={(e) => setNewTeam({ ...newTeam, purpose: e.target.value })}
                    className="h-14 bg-white/5 border-white/10 text-white rounded-xl focus:border-blue-500/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Operational Type</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setNewTeam({ ...newTeam, type: "event-based" })}
                      className={`flex-1 h-14 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        newTeam.type === "event-based" 
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20" 
                        : "bg-white/5 text-white/30 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      EVENT-LINKED
                    </button>
                    <button
                      onClick={() => setNewTeam({ ...newTeam, type: "independent" })}
                      className={`flex-1 h-14 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        newTeam.type === "independent" 
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20" 
                        : "bg-white/5 text-white/30 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      STANDALONE
                    </button>
                  </div>
                </div>

                {newTeam.type === "event-based" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Select Operations Center</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event.id)}
                          className={`w-full p-4 border rounded-xl text-left transition-all group ${
                            selectedEvent === event.id
                              ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/50"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                             <p className={`font-black tracking-tight ${selectedEvent === event.id ? "text-blue-400" : "text-white"}`}>{event.title}</p>
                             <div className={`w-2 h-2 rounded-full ${selectedEvent === event.id ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-white/10"}`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <Button
                    variant="ghost"
                    className="flex-1 h-16 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                  >
                    Abort
                  </Button>
                  <Button
                    className="flex-1 h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-600/20"
                    onClick={handleCreateTeam}
                    disabled={isCreating}
                  >
                    {isCreating ? "Deploying..." : "Confirm Deployment"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
              onClick={() => setIsDeleting(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0a0a0f] border border-red-500/20 rounded-[2.5rem] shadow-2xl p-10 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 mx-auto">
                 <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-3xl font-black text-white leading-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>PURGE SQUAD?</h3>
              <p className="text-white/40 text-sm font-medium italic mb-10">This will permanently deauthorize all team members and erase operational history from the primary database.</p>
              
              <div className="flex flex-col gap-3">
                 <Button
                    onClick={() => { handleDeleteTeam(isDeleting); setIsDeleting(null); }}
                    className="h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-xl shadow-red-600/20"
                 >
                   CONFIRM PURGE
                 </Button>
                 <Button
                    variant="ghost"
                    className="h-14 rounded-2xl text-white/40 hover:text-white"
                    onClick={() => setIsDeleting(null)}
                 >
                   ABORT MISSION
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </HRLayout>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const themes: any = {
    blue: { border: "border-blue-500/20", text: "text-blue-400", bg: "bg-blue-600/10" },
    purple: { border: "border-purple-500/20", text: "text-purple-400", bg: "bg-purple-600/10" },
    emerald: { border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-600/10" },
    amber: { border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-600/10" },
  }
  const theme = themes[color]
  return (
    <div className={`bg-white/[0.02] border ${theme.border} backdrop-blur-xl p-6 rounded-3xl group hover:bg-white/[0.04] transition-all duration-500`}>
      <div className="flex items-center justify-between mb-2">
         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</p>
         <div className={`p-2 rounded-xl ${theme.bg} ${theme.text}`}>
            <Icon className="w-4 h-4" />
         </div>
      </div>
      <p className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
    </div>
  )
}

function TeamCard({ team, index, onManage, onEdit, onDelete, isActionMenuOpen, setActionMenuId }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/30 rounded-[2rem] overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-blue-500/10 flex flex-col"
    >
      <div className="p-8 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-white tracking-tight truncate group-hover:text-blue-400 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{team.name}</h3>
                <span className={`w-2 h-2 rounded-full ${team.status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/20"}`} />
             </div>
             <p className="text-white/40 text-sm font-medium line-clamp-1">{team.purpose || "No operational summary defined"}</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setActionMenuId(isActionMenuOpen ? null : team.id)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors border border-white/5"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {isActionMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-12 w-48 bg-[#0a0a10] border border-white/10 rounded-2xl shadow-2xl z-20 py-2 backdrop-blur-xl"
                >
                  <button onClick={onManage} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                    <Eye className="w-4 h-4 text-blue-400" /> Squadron Intel
                  </button>
                  <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                    <Edit className="w-4 h-4 text-indigo-400" /> Modify Parameters
                  </button>
                  <div className="border-t border-white/5 my-2" />
                  <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" /> Final Recall
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Members Avatars */}
        {team.members && team.members.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {team.members.slice(0, 10).map((member: any) => (
               <div key={member.id} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all hover:bg-white/10 hover:border-white/20" title={member.user?.name}>
                 {member.user?.avatarId ? (
                    // In a generic scenario we'd show the avatar image, but here we can just use initials to be safe
                    <span className="text-[10px] font-bold text-white/60 uppercase">{member.user?.name?.charAt(0)}</span>
                 ) : (
                    <span className="text-[10px] font-bold text-white/60 uppercase">{member.user?.name?.charAt(0)}</span>
                 )}
               </div>
            ))}
            {team.members.length > 10 && (
               <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                 <span className="text-[10px] font-black text-blue-400">+{team.members.length - 10}</span>
               </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="space-y-4 mb-8">
           <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl transition-all group-hover:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Members</span>
              </div>
              <span className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{team.memberCount}</span>
           </div>

           <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl transition-all group-hover:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-400" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Tasks</span>
              </div>
              <span className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{team.taskCount}</span>
           </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/[0.05] flex items-center justify-between">
           {team.eventId ? (
             <div className="flex items-center gap-2 text-purple-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Operation Bound</span>
             </div>
           ) : (
             <div className="flex items-center gap-2 text-blue-400/60">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Independent Unit</span>
             </div>
           )}
           <button 
             onClick={onManage} 
             className="flex items-center gap-2 text-white/20 hover:text-blue-400 transition-all font-black uppercase text-[8px] tracking-[0.3em] group/btn"
           >
              INTEL
              <Eye className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
           </button>
        </div>
      </div>
    </motion.div>
  )
}
