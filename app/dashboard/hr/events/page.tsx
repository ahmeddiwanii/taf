"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { HRLayout } from "../../../../components/layout/hr-layout"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Input } from "../../../../components/ui/input"
import {
  Calendar, MapPin, Users, Plus, Eye, Edit, Clock, Search, Trash2, ArrowRight,
  CheckCircle, XCircle, MoreVertical, Download, Filter, Target, Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Event {
  id: string; title: string; description?: string; type: string; format: string
  price: number; currency: string; visibility: string; status: string
  startAt: string; endAt?: string; location?: string; venue?: string
  posterUrl?: string; qrCodeUrl?: string
  tags?: string[] | null
  maxParticipants?: number | null
  _count?: { registrations: number; attendances: number; feedbacks: number }
}

const TYPE_LABELS: Record<string, string> = {
  GENERAL: '📋 General Event',
  TRAINING: '🎓 Training',
  WORKSHOP: '🛠️ Workshop',
  CONFERENCE: '🎤 Conference',
  MEETING: '👔 Meeting',
  WEBINAR: '💻 Webinar',
  VOLUNTEERING: '🤝 Volunteering',
  FUNDRAISER: '💰 Fundraiser',
  SOCIAL: '🎉 Social',
  COMPETITION: '🏆 Competition',
}

export default function HREventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/events?includeAll=true")
      const data = await res.json()
      setEvents(data.events || data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [])

  const handleDelete = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" })
      if (res.ok) { setEvents(events.filter(e => e.id !== eventId)); setDeleteConfirm(null) }
    } catch { }
  }

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setEvents(events.map(e => e.id === eventId ? { ...e, status: newStatus } : e))
        setActionMenuId(null)
      }
    } catch { }
  }

  const handleVisibilityToggle = async (eventId: string, current: string) => {
    const next = current === "PUBLIC" ? "PRIVATE" : "PUBLIC"
    try {
      const res = await fetch(`/api/events/${eventId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: next }),
      })
      if (res.ok) setEvents(events.map(e => e.id === eventId ? { ...e, visibility: next } : e))
    } catch { }
  }

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "UPCOMING": return "bg-blue-50 text-blue-700 border-blue-200"
      case "ONGOING": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "COMPLETED": return "bg-gray-100 text-gray-600 border-gray-200"
      case "CANCELLED": return "bg-red-50 text-red-600 border-red-200"
      default: return "bg-gray-50 text-gray-600"
    }
  }

  const filtered = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const statuses = ["all", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      {/* Header & Metrics */}
      <div className="mb-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Operations Registry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Events & Volunteering</h1>
            <p className="text-sm text-white/40 mt-2 font-medium">Coordinate organization events, volunteer initiatives, and mission-critical meetings.</p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold gap-2 shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-105 border-0">
            <Link href="/dashboard/hr/events/new"><Plus className="w-5 h-5" /> Create Event</Link>
          </Button>
        </div>

        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <MetricCard icon={Calendar} label="Total Events" value={events.length} color="blue" />
             <MetricCard icon={Target} label="Upcoming" value={events.filter(e => e.status === "UPCOMING").length} color="emerald" />
             <MetricCard icon={Users} label="Total Registrations" value={events.reduce((acc, e) => acc + (e._count?.registrations || 0), 0)} color="purple" />
             <MetricCard icon={Zap} label="Impact Missions" value={events.filter(e => e.type === "VOLUNTEERING" || e.type === "FUNDRAISER").length} color="amber" />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white/[0.02] border border-white/[0.08] p-4 rounded-2xl backdrop-blur-md relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 bg-white/[0.03] border-white/[0.1] text-white focus:bg-white/[0.08] focus:border-blue-500/50 h-11 rounded-xl transition-all" />
        </div>
        <div className="flex gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${statusFilter === s ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-3xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center bg-white/[0.01] border border-white/[0.06] rounded-3xl backdrop-blur-sm relative z-10">
            <Calendar className="w-20 h-20 text-white/5 mx-auto mb-6" />
            <p className="text-xl font-black text-white/40 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No Operations Found</p>
            <p className="text-sm text-white/20 mt-2 mb-8 max-w-sm mx-auto">{search ? "Your filters yielded no results. Try adjusting the search parameters." : "No events recorded in the registry yet. Initialize your first mission below."}</p>
            <Button asChild size="lg" className="bg-white/5 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-500 font-bold rounded-2xl transition-all">
              <Link href="/dashboard/hr/events/new">Initialize New Event</Link>
            </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {filtered.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <div className="group relative bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/30 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-blue-500/10 flex flex-col h-full">
                {/* Poster strip */}
                <div className="h-44 w-full overflow-hidden relative">
                  {event.posterUrl ? (
                    <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                       <h3 className="text-2xl font-black text-white/10 uppercase tracking-widest px-6 text-center">{event.title}</h3>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Badge className="bg-black/60 text-white/90 border border-white/10 text-[9px] font-black uppercase tracking-wider backdrop-blur-md px-2 py-0.5">
                      {event.type}
                    </Badge>
                    <Badge className={`text-[9px] font-black uppercase tracking-wider border backdrop-blur-md px-2 py-0.5 ${event.visibility === "PUBLIC" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/10 text-white/50 border-white/10"}`}>
                      {event.visibility}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{event.title}</h3>
                      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusGlow(event.status)}`} />
                        <span className={getStatusTextColor(event.status)}>{event.status}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <button onClick={() => setActionMenuId(actionMenuId === event.id ? null : event.id)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors border border-white/5">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {actionMenuId === event.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 top-12 w-48 bg-[#0a0a10] border border-white/10 rounded-2xl shadow-2xl z-20 py-2 backdrop-blur-xl"
                          >
                            <Link href={`/dashboard/hr/events/${event.id}`} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                              <Eye className="w-4 h-4 text-blue-400" /> View Intelligence
                            </Link>
                            <Link href={`/dashboard/hr/events/${event.id}/edit`} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                              <Edit className="w-4 h-4 text-indigo-400" /> Modify Parameters
                            </Link>
                            <div className="border-t border-white/5 my-2" />
                            <p className="px-4 py-1 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Operational Status</p>
                            {["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].filter(s => s !== event.status).map(s => (
                              <button key={s} onClick={() => handleStatusChange(event.id, s)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-white/40 hover:bg-white/5 hover:text-white transition-colors text-left">
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusGlow(s)}`} />
                                {s}
                              </button>
                            ))}
                            <div className="border-t border-white/5 my-2" />
                            <button onClick={() => { setDeleteConfirm(event.id); setActionMenuId(null) }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-4 h-4" /> Purge Record
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-white/40">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-blue-400/60" />
                      </div>
                      <span className="text-xs font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {new Date(event.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &bull; {new Date(event.startAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-3 text-white/40">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-emerald-400/60" />
                        </div>
                        <span className="text-xs font-bold truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/[0.06]">
                    {event.maxParticipants ? (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">
                          <span>Registry Capacity</span>
                          <span className="text-white/60">{event._count?.registrations || 0} / {event.maxParticipants}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.05]">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              ((event._count?.registrations || 0) / event.maxParticipants) >= 1 ? "bg-red-500" 
                              : ((event._count?.registrations || 0) / event.maxParticipants) > 0.8 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                              : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            }`} 
                            style={{ width: `${Math.min(((event._count?.registrations || 0) / event.maxParticipants) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 py-2">
                         <div className="flex-1">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Total Impact</p>
                            <p className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{event._count?.registrations || 0} <span className="text-sm font-bold text-white/20">RECORDS</span></p>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setDeleteConfirm(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50" />
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white text-center mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Purge Record?</h3>
              <p className="text-sm text-white/40 text-center mb-8 font-medium italic">This action will permanently erase all mission data and linked registries from the intelligence core.</p>
              <div className="flex gap-4">
                <Button variant="ghost" className="flex-1 h-12 rounded-xl text-white/60 hover:bg-white/5 font-bold" onClick={() => setDeleteConfirm(null)}>ABORT</Button>
                <Button variant="destructive" className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-600/20" onClick={() => handleDelete(deleteConfirm)}>
                  CONFIRM PURGE
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </HRLayout>
  )
}

function MetricCard({ icon: Icon, label, value, color }: any) {
  const themes: any = {
    blue: { border: "border-blue-500/20", text: "text-blue-400", bg: "bg-blue-600/5" },
    emerald: { border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-600/5" },
    purple: { border: "border-purple-500/20", text: "text-purple-400", bg: "bg-purple-600/5" },
    amber: { border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-600/5" },
  }
  const theme = themes[color]
  return (
    <div className={`bg-white/[0.02] border ${theme.border} backdrop-blur-xl rounded-2xl p-5 group flex items-center justify-between transition-all duration-300 hover:bg-white/[0.04]`}>
      <div>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
      </div>
      <div className={`p-3 rounded-2xl ${theme.bg} border ${theme.border} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${theme.text}`} />
      </div>
    </div>
  )
}

function getStatusGlow(s: string) {
  switch (s) {
    case "ONGOING": return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse"
    case "UPCOMING": return "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
    case "COMPLETED": return "bg-white/20"
    case "CANCELLED": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
    default: return "bg-white/20"
  }
}

function getStatusTextColor(s: string) {
  switch (s) {
    case "ONGOING": return "text-emerald-400"
    case "UPCOMING": return "text-blue-400"
    case "COMPLETED": return "text-white/40"
    case "CANCELLED": return "text-red-400"
    default: return "text-white/40"
  }
}

function getStatusStyle(s: string) {
  switch (s) {
    case "ONGOING": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    case "UPCOMING": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "COMPLETED": return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20"
    default: return ""
  }
}