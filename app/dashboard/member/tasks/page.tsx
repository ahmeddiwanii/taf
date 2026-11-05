"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MemberLayout from "../../../../components/layout/member-layout"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, ClipboardList, CheckCircle2, Clock, AlertCircle, Calendar, Users, Target, Activity, Zap, Check, X
} from "lucide-react"
import { format } from "date-fns"

interface Task {
    id: string; title: string; description?: string; status: string; priority: string
    dueDate?: string; createdAt: string
    assignee?: { id: string; name: string }
    createdBy: { id: string; name: string }
}

const priorityStyle = (p: string) => {
    switch (p) {
        case "URGENT": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] text-white border-red-500"
        case "HIGH": return "bg-orange-500 text-white border-orange-500"
        case "MEDIUM": return "bg-blue-500 text-white border-blue-500"
        default: return "bg-white/10 text-white border-white/5"
    }
}

const statusColor = (s: string) => {
    switch (s) {
        case "COMPLETED": return "text-emerald-400"
        case "IN_PROGRESS": return "text-blue-400"
        case "BLOCKED": return "text-red-400"
        default: return "text-white/40"
    }
}

export default function MemberTasksPage() {
    const { data: session } = useSession()
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)

    useEffect(() => {
        fetch("/api/tasks?limit=100")
            .then(r => r.json())
            .then(d => setTasks(d.tasks || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const filtered = tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
        const matchStatus = !statusFilter || t.status === statusFilter
        return matchSearch && matchStatus
    })

    const stats = {
        total: tasks.length,
        open: tasks.filter(t => t.status === "OPEN" || t.status === "todo").length,
        inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
        completed: tasks.filter(t => t.status === "COMPLETED").length,
    }

    const handleStatusUpdate = async (taskId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            if (res.ok) {
                setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
            }
        } catch { }
    }

    return (
        <MemberLayout>
            <div className="space-y-6 relative z-10 pb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        MY <span className="text-blue-500">TASKS</span>
                    </h1>
                    <p className="text-white/40 font-medium tracking-widest uppercase text-xs flex items-center gap-2">
                       <Target className="w-4 h-4" /> View and update your tasks
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total tasks", value: stats.total, icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-600/10", border: "border-blue-500/20" },
                        { label: "Pending", value: stats.open, icon: Clock, color: "text-white/60", bg: "bg-white/5", border: "border-white/10" },
                        { label: "In progress", value: stats.inProgress, icon: Zap, color: "text-amber-400", bg: "bg-amber-600/10", border: "border-amber-500/20" },
                        { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-600/10", border: "border-emerald-500/20" },
                    ].map(s => (
                        <div key={s.label} className={`border ${s.border} bg-white/[0.02] backdrop-blur-xl p-4 rounded-2xl group hover:bg-white/[0.04] transition-all`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">{s.label}</span>
                                <div className={`p-1.5 rounded-lg ${s.bg} ${s.color}`}>
                                    <s.icon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                        </div>
                    ))}
                </motion.div>

                <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                            <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} 
                                className="pl-9 h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500" 
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                            {["OPEN", "IN_PROGRESS", "COMPLETED", "BLOCKED"].map(s => (
                                <button key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s 
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                                        : "bg-white/[0.02] text-white/40 border border-white/5 hover:text-white hover:bg-white/[0.06]"}`}>
                                    {s.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tasks List */}
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <Activity className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-sm font-black text-white/40 uppercase tracking-widest">No tasks found</p>
                            <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">{search ? "Try a different search" : "You have no tasks yet"}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filtered.map(task => (
                                    <motion.div 
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] transition-all relative overflow-hidden"
                                    >
                                        {/* Status Accent Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                            task.status === "COMPLETED" ? "bg-emerald-500" :
                                            task.status === "IN_PROGRESS" ? "bg-blue-500/50" :
                                            task.priority === "URGENT" ? "bg-red-500" : "bg-white/10"
                                        }`} />

                                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start pl-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3 className="text-base font-bold text-white tracking-tight">{task.title}</h3>
                                                    <Badge className={`text-[9px] font-black tracking-widest uppercase border-none px-2 py-0.5 ${priorityStyle(task.priority)}`}>
                                                        {task.priority === "URGENT" ? "CRITICAL" : task.priority}
                                                    </Badge>
                                                    <Badge className={`text-[9px] font-black tracking-widest uppercase border border-white/10 bg-white/5 px-2 py-0.5 ${statusColor(task.status)}`}>
                                                        {task.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                {task.description && <p className="text-xs text-white/40 mb-3 line-clamp-2">{task.description}</p>}
                                                <div className="flex items-center gap-4 text-[10px] text-white/30 font-bold uppercase tracking-widest flex-wrap">
                                                    {task.dueDate && (
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-purple-400" /> TIMEFRAME: {format(new Date(task.dueDate), "MMM d")}</span>
                                                    )}
                                                    <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-blue-400" /> ISSUED BY {task.createdBy.name}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-white/5">
                                                <Button 
                                                    asChild
                                                    size="sm" 
                                                    className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest h-9 bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:bg-blue-500/30 hover:text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                                                >
                                                    <a href={`/dashboard/member/tasks/${task.id}`}>
                                                        <Activity className="w-3 h-3 mr-2" /> Open Terminal
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </MemberLayout>
    )
}
