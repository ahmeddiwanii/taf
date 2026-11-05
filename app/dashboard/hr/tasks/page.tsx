"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HRLayout } from "@/components/layout/hr-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2, Clock, AlertCircle, Plus, ArrowRight, ClipboardList, Search, Users, Calendar,
  MoreVertical, Target, Zap, Shield, Filter, LayoutGrid, Trash2, ChevronDown
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface Task {
  id: string; title: string; description?: string; status: string; priority: string
  dueDate?: string; createdAt: string
  createdBy: { id: string; name: string; email: string }
  team: { id: string; name: string, purpose: string }
  assignments?: { id: string, userId: string, user: { name: string } }[]
}

const priorityConfig: any = {
  URGENT: { border: "border-red-500/30", text: "text-red-400", bg: "bg-red-500/10", label: "CRITICAL" },
  HIGH: { border: "border-orange-500/30", text: "text-orange-400", bg: "bg-orange-500/10", label: "HIGH PRIO" },
  MEDIUM: { border: "border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10", label: "STANDBY" },
  LOW: { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10", label: "ROUTINE" },
}

const statusConfig: any = {
  FINALIZED: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "FINALIZED" },
  ACTIVE: { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "ACTIVE" },
  PENDING: { icon: Clock, color: "text-white/40", bg: "bg-white/5", border: "border-white/10", label: "PENDING" },
}

export default function HRTasksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/teams/tasks")
      const d = await r.json()
      setTasks(d.tasks || [])
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to terminate this objective?")) return
    try {
      const res = await fetch(`/api/teams/tasks/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Objective Terminated")
        fetchData()
      }
    } catch (error) {
      toast.error("Operation Failed")
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    try {
      const res = await fetch(`/api/teams/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        toast.error("Network Error: Failed to sync status")
        fetchData() // Revert back
      } else {
        toast.success(`Status upgraded to ${newStatus}`)
      }
    } catch {
      toast.error("Transmission Error")
      fetchData() // Revert back
    }
  }

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || t.status === statusFilter
    const matchPriority = !priorityFilter || t.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  // Ensure calculations dynamically map what's seen
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "PENDING").length,
    active: tasks.filter(t => t.status === "ACTIVE").length,
    finalized: tasks.filter(t => t.status === "FINALIZED").length,
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
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              MISSION <span className="text-blue-500">CONTROL</span>
            </h1>
            <p className="text-white/40 font-medium tracking-wide">Coordinate deployment tasks and operational objectives</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >

            <Button asChild className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white gap-3 rounded-2xl shadow-xl shadow-blue-600/20 border border-blue-500/50 font-black transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px]">
              <Link href="/dashboard/hr/tasks/create" className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                ASSIGN OBJECTIVE
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="TOTAL ASSETS" value={stats.total} icon={ClipboardList} color="blue" />
          <StatCard label="PENDING" value={stats.pending} icon={Clock} color="white/20" />
          <StatCard label="ACTIVE OPS" value={stats.active} icon={Zap} color="amber" />
          <StatCard label="FINALIZED" value={stats.finalized} icon={CheckCircle2} color="emerald" />
        </div>

        {/* Filters */}
        <div className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
              <div className="lg:col-span-2 space-y-2">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Objective Search</p>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Locate objectives in the datastream..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-16 pl-14 bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-white rounded-2xl transition-all backdrop-blur-xl group-hover:bg-white/[0.05]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Quick Filters</p>
                 <div className="flex p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl h-16 items-center gap-2">
                    <Button variant="ghost" className="flex-1 h-full rounded-xl text-[10px] font-black uppercase text-white/30 hover:text-white hover:bg-white/5">
                       <Filter className="w-4 h-4 mr-2" /> Sort
                    </Button>
                    <Button variant="ghost" className="flex-1 h-full rounded-xl text-[10px] font-black uppercase text-white/30 hover:text-white hover:bg-white/5">
                       <LayoutGrid className="w-4 h-4 mr-2" /> View
                    </Button>
                 </div>
              </div>
           </div>

           <div className="flex flex-wrap gap-3">
              <p className="w-full text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 mb-1">Status Classification</p>
              {["PENDING", "ACTIVE", "FINALIZED"].map(s => {
                const isActive = statusFilter === s
                const style = statusConfig[s]
                return (
                  <button 
                    key={s} 
                    onClick={() => setStatusFilter(isActive ? null : s)}
                    className={`h-11 px-6 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive 
                      ? `${style.bg} ${style.color} ${style.border} shadow-lg` 
                      : "bg-white/[0.02] text-white/30 border-white/5 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
              <div className="w-px h-11 bg-white/5 mx-2" />
              {["URGENT", "HIGH", "MEDIUM", "LOW"].map(p => {
                const isActive = priorityFilter === p
                return (
                  <button 
                    key={p} 
                    onClick={() => setPriorityFilter(isActive ? null : p)}
                    className={`h-11 px-6 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive 
                      ? "bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20" 
                      : "bg-white/[0.02] text-white/30 border-white/5 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
           </div>
        </div>

        {/* Tasks List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 text-center bg-white/[0.02] border border-white/[0.08] rounded-[3rem] backdrop-blur-xl"
            >
              <ClipboardList className="w-20 h-20 text-white/5 mx-auto mb-6" />
              <p className="text-xl font-black text-white/40 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Grid Silence Detected</p>
              <p className="text-sm text-white/20 mt-2 mb-8 max-w-sm mx-auto">No matching objectives found in the current datastream. Initialize a new mission priority.</p>
              <Button asChild className="h-12 px-8 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white font-bold rounded-xl transition-all">
                <Link href="/dashboard/hr/tasks/create">NEW MISSION</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filtered.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  index={index} 
                  onDelete={() => handleDelete(task.id)} 
                  onStatusChange={(status) => handleStatusChange(task.id, status)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HRLayout>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-8 rounded-[2rem] group hover:bg-white/[0.04] transition-all duration-500">
      <div className="flex items-center justify-between mb-2">
         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</p>
         <div className={`p-2 rounded-xl bg-white/5 text-white/40 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-all`}>
            <Icon className="w-4 h-4" />
         </div>
      </div>
      <p className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
    </div>
  )
}

function TaskCard({ task, index, onDelete, onStatusChange }: { task: Task, index: number, onDelete: () => void, onStatusChange: (status: string) => void }) {
  const pr = priorityConfig[task.priority] || priorityConfig.LOW
  const st = statusConfig[task.status] || statusConfig.PENDING
  const StatusIcon = st.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/30 rounded-[2rem] overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-blue-500/10"
    >
      <div className="p-8 flex flex-col xl:flex-row items-start xl:items-center gap-8">
        {/* Left: Status Icon */}
        <div className={`p-5 rounded-[1.5rem] bg-white/5 border border-white/5 transition-all group-hover:scale-110 ${st.bg} ${st.border}`}>
           <StatusIcon className={`w-8 h-8 ${st.color} transition-all`} />
        </div>

        {/* Center: Content */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
             <h3 className="text-xl font-black text-white tracking-tight truncate group-hover:text-blue-400 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {task.title}
             </h3>
             <Badge className={`h-6 px-3 text-[10px] font-black tracking-widest border ${pr.border} ${pr.bg} ${pr.text} rounded-lg`}>
                {pr.label}
             </Badge>
             
             {/* Dynamic HR Production Task Changer Dropdown */}
             <div className="relative group/select">
               <select 
                 value={task.status}
                 onChange={(e) => onStatusChange(e.target.value)}
                 className={`h-6 pl-3 pr-7 text-[10px] font-black tracking-widest border ${st.border} ${st.bg} ${st.color} rounded-lg cursor-pointer outline-none appearance-none hover:brightness-125 transition-all`}
               >
                 {["PENDING", "ACTIVE", "FINALIZED"].map(s => (
                   <option key={s} value={s} className="bg-[#0a0a0f] text-white py-2 border-none">
                     {s}
                   </option>
                 ))}
               </select>
               <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${st.color} pointer-events-none`} />
             </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
             {task.description && (
               <p className="text-sm text-white/30 font-medium line-clamp-1 flex-1 max-w-md">
                 {task.description}
               </p>
             )}
             <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[10px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/20 transition-colors mt-2 md:mt-0">
                {task.team && (
                  <div className="flex items-center gap-2">
                     <Users className="w-3.5 h-3.5" />
                     <span>SQUAD {task.team.name}</span>
                  </div>
                )}
                {task.assignments && task.assignments.length > 0 && (
                  <div className="flex items-center gap-2">
                     <Target className="w-3.5 h-3.5" />
                     <span>{task.assignments.length} ASSETS DEPLOYED</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-2 text-blue-400/40 group-hover:text-blue-400 transition-colors">
                     <Calendar className="w-3.5 h-3.5" />
                     <span>ETA: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0 pt-4 xl:pt-0 border-t border-white/5 xl:border-none">
          <button 
            onClick={onDelete}
            className="p-4 rounded-2xl bg-white/5 hover:bg-red-500/20 text-white/10 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/30 flex-1 xl:flex-none flex items-center justify-center"
            title="Terminate Objective"
          >
             <Trash2 className="w-6 h-6" />
          </button>
          <Link href={`/dashboard/hr/tasks/${task.id}`} className="flex-1 xl:flex-none">
            <button className="w-full p-4 rounded-2xl bg-white/5 hover:bg-blue-600 text-white/20 hover:text-white transition-all border border-white/5 hover:border-blue-500 shadow-xl group-hover:shadow-blue-600/20 flex items-center justify-center">
               <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
