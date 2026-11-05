"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import { 
  Plus, 
  ArrowLeft, 
  Zap, 
  Target, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Rocket,
  Shield,
  Clock,
  LayoutGrid
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Team {
  id: string
  name: string
  purpose: string
  members: { userId: string, user: { name: string } }[]
}

export default function CreateTaskPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    teamId: "",
    assigneeId: "",
    dueDate: "",
    hrDocumentName: "",
    hrDocumentUrl: ""
  })

  useEffect(() => {
    if (session?.user?.organizationId) {
      fetchTeams()
    }
  }, [session])

  const fetchTeams = async () => {
    try {
      const res = await fetch(`/api/teams?organizationId=${session?.user.organizationId}`)
      const data = await res.json()
      setTeams(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching teams:", error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.teamId) {
      toast.error("Required fields missing")
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId: session?.user.organizationId
        })
      })

      if (res.ok) {
        toast.success("Mission Objective Assigned")
        router.push("/dashboard/hr/tasks")
      } else {
        toast.error("Assignment Failed")
      }
    } catch (error) {
      toast.error("System Error")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTeam = teams.find(t => t.id === formData.teamId)

  return (
    <HRLayout orgName={session?.user.name || "Organization"}>
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6 -ml-4 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Command
          </Button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ASSIGN <span className="text-blue-500">OBJECTIVE</span>
            </h1>
            <p className="text-white/40 font-medium tracking-widest mt-2 uppercase text-[10px]">Initialize tactical deployment and task distribution</p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Config (Left) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title & Description */}
            <div className="space-y-6">
              <div className="group">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 ml-1">Objective Title</p>
                <Input 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Protocol Zero Implementation"
                  className="h-16 bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-xl font-bold rounded-2xl transition-all"
                />
              </div>
              
              <div className="group">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 ml-1">Mission Parameters</p>
                <Textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detail the operational requirements..."
                  className="min-h-[200px] bg-white/[0.03] border-white/[0.08] focus:border-blue-500/50 text-base rounded-2xl transition-all resize-none p-6"
                />
              </div>

              {/* Document Attachment */}
              <div className="group">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 ml-1">Briefing Attachment (Optional)</p>
                <div className="relative overflow-hidden bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.05] transition-all focus-within:border-blue-500/50">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({
                            ...formData,
                            hrDocumentName: file.name,
                            hrDocumentUrl: reader.result as string
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                       <CheckCircle2 className={`w-4 h-4 ${formData.hrDocumentName ? 'block' : 'hidden'}`} />
                       <Plus className={`w-4 h-4 ${formData.hrDocumentName ? 'hidden' : 'block'}`} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white tracking-widest uppercase">
                         {formData.hrDocumentName || "Attach Document"}
                       </p>
                       <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
                         {formData.hrDocumentName ? "File Ready for Transmission" : "PDF, Images, or Text Formats"}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Deployment Priority</p>
                  <div className="grid grid-cols-2 gap-2">
                     {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => (
                       <button
                         key={p}
                         type="button"
                         onClick={() => setFormData({...formData, priority: p})}
                         className={`h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                           formData.priority === p 
                           ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20" 
                           : "bg-white/[0.02] text-white/20 border-white/5 hover:border-white/20"
                         }`}
                       >
                         {p}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Deadline Horizon</p>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      type="date"
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                      className="h-12 pl-12 bg-white/[0.03] border-white/[0.08] focus:border-blue-400/50 text-sm font-bold rounded-xl [color-scheme:dark]"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Unit Assignment (Right) */}
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />
               
               <div className="flex items-center gap-3 mb-8">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-black text-white tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Unit Allocation</h3>
               </div>

               <div className="space-y-6">
                  {/* Select Squad */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Primary Squad</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {teams.map(team => (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => setFormData({...formData, teamId: team.id, assigneeId: ""})}
                          className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                            formData.teamId === team.id 
                            ? "bg-blue-600/10 border-blue-500/50 text-white" 
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                             <Users className={`w-4 h-4 ${formData.teamId === team.id ? 'text-blue-400' : 'text-white/20'}`} />
                             <span className="text-xs font-black uppercase tracking-wider">{team.name}</span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${formData.teamId === team.id ? 'bg-blue-500' : 'bg-white/10'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Individual in Squad */}
                  {selectedTeam && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-3 pt-6 border-t border-white/5"
                    >
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Specific Asset (Optional)</p>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, assigneeId: ""})}
                          className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                            formData.assigneeId === "" 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">Entire Squad</span>
                        </button>
                        {selectedTeam.members.map(member => (
                          <button
                            key={member.userId}
                            type="button"
                            onClick={() => setFormData({...formData, assigneeId: member.userId})}
                            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                              formData.assigneeId === member.userId 
                              ? "bg-blue-600/10 border-blue-500/40 text-white" 
                              : "bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <span className="text-[10px] font-bold">{member.user.name}</span>
                            <Target className={`w-3.5 h-3.5 ${formData.assigneeId === member.userId ? 'text-blue-400' : 'opacity-0'}`} />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
               </div>

               <div className="mt-10">
                  <Button 
                    disabled={submitting || !formData.title || !formData.teamId}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 border border-blue-500/50 uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-20"
                  >
                    {submitting ? "Transmitting..." : (
                      <>
                        <Zap className="w-5 h-5 mr-3" />
                        Execute Assignment
                      </>
                    )}
                  </Button>
               </div>
            </div>

            {/* Visual Context */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-blue-500/20 p-6 rounded-[2rem]">
               <div className="flex items-center gap-3 mb-3 text-blue-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">System Intelligence</span>
               </div>
               <p className="text-[10px] leading-relaxed text-white/40 font-medium tracking-wide">
                 Personnel assigned to this objective will receive immediate synchronization. Activity logs will be monitored in real-time.
               </p>
            </div>
          </div>
        </form>
      </div>
    </HRLayout>
  )
}
