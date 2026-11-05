"use client"
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle, Clock, X, Eye, Lock, MessageSquare, AlertCircle, 
  Send, Sparkles, Zap, TrendingUp, Filter, Lightbulb, Calendar, 
  Target, Users, Check, Trash2, ArrowRight, Shield, Activity, BarChart3, Layers,
  FileDown,
} from "lucide-react"

import { HRLayout } from "../../../../components/layout/hr-layout"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { ProposalPdfTemplate } from "@/components/pdf/proposal-pdf-template"
import { toast } from "sonner"
import { Card, CardContent } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"

const statusTheme: any = {
  approved: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle },
  submitted: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock },
  rejected: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: X },
  in_review: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Activity },
}

const typeTheme: any = {
  idea: { icon: Lightbulb, color: "text-amber-400" },
  event: { icon: Calendar, color: "text-blue-400" },
  project: { icon: Target, color: "text-rose-400" },
  initiative: { icon: TrendingUp, color: "text-emerald-400" },
  default: { icon: Sparkles, color: "text-purple-400" },
}

function proposalSwot(p: any) {
  const c = p?.canvasJson?.swot
  if (c && typeof c === "object") return c
  const s = p?.swotJson
  if (s && typeof s === "object") return s
  return {}
}

function proposalSmart(p: any) {
  const m = p?.canvasJson?.smart
  if (m && typeof m === "object") return m
  return {}
}

function visibilityLabel(v: string) {
  if (v === "PRIVATE") return "Private"
  if (v === "HR_ONLY") return "HR only"
  if (v === "ORG") return "Organization"
  return v || "—"
}

export default function HRProposalsPage() {
  const { data: session } = useSession()
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [responseMessage, setResponseMessage] = useState("")
  const pdfRef = React.useRef<HTMLDivElement>(null)

  const handleDownloadPdf = async (proposal: any) => {
    if (!pdfRef.current) return
    try {
      const toastId = toast.loading("Generating professional PDF...")
      
      // Delay to allow React to render the offline template with the new proposal data
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })
      
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Proposal-${proposal.id.slice(-8).toUpperCase()}.pdf`)
      
      toast.success("PDF generated successfully", { id: toastId })
    } catch (e) {
      console.error(e)
      toast.error("Could not create PDF")
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals")
      const data = await response.json()
      setProposals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Shield protocols failed to fetch data stream:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", visibility: "ORG" }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        toast.error(typeof err?.error === "string" ? err.error : "Could not approve proposal")
        return
      }
      if (responseMessage.trim()) {
        const c = await fetch(`/api/proposals/${proposalId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: responseMessage }),
        })
        if (!c.ok) {
          const err = await c.json().catch(() => ({}))
          toast.error(typeof err?.error === "string" ? err.error : "Approved, but the note was not saved")
        }
      }
      toast.success("Proposal approved")
      await fetchProposals()
      setShowDetails(false)
      setResponseMessage("")
    } catch (error) {
      console.error("Authorization cycle failed:", error)
      toast.error("Could not approve proposal")
    }
  }

  const handleReject = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        toast.error(typeof err?.error === "string" ? err.error : "Could not reject proposal")
        return
      }
      if (responseMessage.trim()) {
        const c = await fetch(`/api/proposals/${proposalId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: responseMessage }),
        })
        if (!c.ok) {
          const err = await c.json().catch(() => ({}))
          toast.error(typeof err?.error === "string" ? err.error : "Rejected, but the note was not saved")
        }
      }
      toast.success("Proposal rejected")
      await fetchProposals()
      setShowDetails(false)
      setResponseMessage("")
    } catch (error) {
      console.error("Sanitization cycle failed:", error)
      toast.error("Could not reject proposal")
    }
  }

  const filteredProposals = proposals.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  )

  return (
    <>
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, pointerEvents: "none" }}>
        {selectedProposal && <ProposalPdfTemplate ref={pdfRef} proposal={selectedProposal} />}
      </div>
      <HRLayout orgName={session?.user?.name || "Organization"}>
      <div className="space-y-10 relative z-10 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Member submissions</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ideas <span className="text-blue-500">inbox</span>
            </h1>
            <p className="text-white/40 font-medium tracking-wide mt-2 max-w-xl">
              Review ideas, events, and initiatives from members. Approve to share with the organization or reject with a short note.
            </p>
          </div>
          
          <div className="flex gap-4 p-1.5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl">
            {["all", "submitted", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-white/40 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Total", value: proposals.length, icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
             { label: "Pending", value: proposals.filter(p => p.status === "submitted").length, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
             { label: "Approved", value: proposals.filter(p => p.status === "approved").length, icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
             { label: "Rejected", value: proposals.filter(p => p.status === "rejected").length, icon: X, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
           ].map((stat, i) => (
             <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
               <Card className="border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-3xl rounded-3xl overflow-hidden group">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{stat.label}</span>
                       <div className={`p-2 rounded-xl ${stat.bg} border ${stat.border}`}>
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                       </div>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                 </CardContent>
               </Card>
             </motion.div>
           ))}
        </div>

        {/* Proposals Feed */}
        <div className="space-y-4">
           {isLoading ? (
             <div className="py-24 text-center">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Syncing Feed Matrix...</p>
             </div>
           ) : filteredProposals.length === 0 ? (
             <div className="py-24 text-center border border-dashed border-white/[0.1] rounded-[3rem]">
                <Lightbulb className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white/40 uppercase tracking-tight">Feed Terminated</h3>
                <p className="text-white/20 text-sm font-medium mt-1">No operational proposals detected in current filter segment.</p>
             </div>
           ) : (
             <AnimatePresence>
                {filteredProposals.map((proposal, idx) => (
                  <ProposalCard 
                    key={proposal.id} 
                    proposal={proposal} 
                    idx={idx} 
                    onClick={() => {
                      setSelectedProposal(proposal)
                      setShowDetails(true)
                    }} 
                  />
                ))}
             </AnimatePresence>
           )}
        </div>
      </div>

      {/* Modern Slide-in Review Panel */}
      <AnimatePresence>
        {showDetails && selectedProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#050508]/90 backdrop-blur-3xl"
              onClick={() => setShowDetails(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0a0a0f] border border-white/[0.1] shadow-2xl rounded-[2rem] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 p-6 sm:p-8 border-b border-white/[0.06]">
                 <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                       <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          {React.createElement((typeTheme[selectedProposal.type] || typeTheme.default).icon, { className: "w-7 h-7 text-blue-400" })}
                       </div>
                       <div className="min-w-0">
                          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight break-words" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{selectedProposal.title}</h2>
                          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Ref · {selectedProposal.id.slice(-8).toUpperCase()}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="border-white/15 text-white/60 text-[9px] font-black uppercase">
                              Type: {selectedProposal.type || "—"}
                            </Badge>
                            <Badge variant="outline" className="border-white/15 text-white/60 text-[9px] font-black uppercase">
                              {visibilityLabel(selectedProposal.visibility)}
                            </Badge>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                       <Button
                         type="button"
                         variant="outline"
                         className="h-10 px-3 border-white/15 bg-white/[0.04] text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest gap-2"
                         onClick={() => handleDownloadPdf(selectedProposal)}
                       >
                         <FileDown className="w-4 h-4" />
                         PDF
                       </Button>
                       <button type="button" onClick={() => setShowDetails(false)} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white/40 hover:text-white transition-all">
                          <X className="w-5 h-5" />
                       </button>
                    </div>
                 </div>

                 <div className="flex flex-wrap items-center gap-4 mt-6 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">
                          {selectedProposal.submittedBy?.name?.slice(0, 2).toUpperCase()}
                       </div>
                       <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{selectedProposal.submittedBy?.name}</span>
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <div className="flex items-center gap-2 text-white/40">
                       <Calendar className="w-3 h-3" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{new Date(selectedProposal.createdAt).toLocaleString()}</span>
                    </div>
                    {(selectedProposal.timelineStart || selectedProposal.timelineEnd) && (
                      <>
                        <div className="h-4 w-px bg-white/10 hidden sm:block" />
                        <span className="text-[10px] font-black text-white/35 uppercase tracking-widest">
                          {selectedProposal.timelineStart ? `From ${new Date(selectedProposal.timelineStart).toLocaleDateString()}` : ""}
                          {selectedProposal.timelineEnd ? ` → ${new Date(selectedProposal.timelineEnd).toLocaleDateString()}` : ""}
                        </span>
                      </>
                    )}
                    <div className="sm:ml-auto">
                       <Badge className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${(statusTheme[selectedProposal.status] || statusTheme.submitted).bg} ${(statusTheme[selectedProposal.status] || statusTheme.submitted).color} border ${(statusTheme[selectedProposal.status] || statusTheme.submitted).border}`}>
                          {selectedProposal.status}
                       </Badge>
                    </div>
                 </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-6 space-y-8 custom-scrollbar">
                    <section>
                       <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <Activity className="w-3 h-3" /> Member write-up (main text)
                       </h4>
                       <p className="text-sm font-medium text-white/75 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-5 rounded-2xl border border-white/[0.06]">
                          {selectedProposal.expectedImpact ||
                            selectedProposal.canvasJson?.description ||
                            "No main write-up was provided."}
                       </p>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">SWOT (member fields)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          ["strengths", "Strengths", "text-emerald-400/90"],
                          ["weaknesses", "Weaknesses", "text-amber-200/90"],
                          ["opportunities", "Opportunities", "text-sky-300/90"],
                          ["threats", "Threats", "text-rose-300/90"],
                        ].map(([key, label, color]) => {
                          const sw = proposalSwot(selectedProposal) as Record<string, string>
                          const val = sw[key] || ""
                          return (
                            <div key={key} className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${color}`}>{label}</p>
                              <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{val.trim() || "—"}</p>
                            </div>
                          )
                        })}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">SMART (member fields)</h4>
                      <div className="space-y-3">
                        {[
                          ["specific", "Specific"],
                          ["measurable", "Measurable"],
                          ["achievable", "Achievable"],
                          ["relevant", "Relevant"],
                          ["timeBound", "Time-bound"],
                        ].map(([key, label]) => {
                          const sm = proposalSmart(selectedProposal) as Record<string, string>
                          const val = sm[key] || ""
                          return (
                            <div key={key} className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                              <p className="text-[10px] font-black text-violet-300/90 uppercase tracking-widest mb-2">{label}</p>
                              <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{val.trim() || "—"}</p>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                    
                    {selectedProposal.comments?.length > 0 && (
                      <section>
                         <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Comments thread</h4>
                         <div className="space-y-2">
                            {selectedProposal.comments.map((c: any) => (
                              <div key={c.id} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                                 <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{c.author?.name || "HR"}</span>
                                    <span className="text-[9px] text-white/25">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</span>
                                 </div>
                                 <p className="text-sm text-white/55 whitespace-pre-wrap">{c.body}</p>
                              </div>
                            ))}
                         </div>
                      </section>
                    )}
                 </div>

                 <div className="shrink-0 border-t border-white/[0.06] p-6 sm:p-8 bg-[#06060a]">
                 {selectedProposal.status === "submitted" ? (
                   <div className="space-y-4">
                      <div className="relative">
                         <textarea 
                           value={responseMessage}
                           onChange={(e) => setResponseMessage(e.target.value)}
                           className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/30 transition-all min-h-[100px] resize-y"
                           placeholder="Optional note to the member (saved with approve or reject)…"
                         />
                         <div className="absolute top-4 right-4 pointer-events-none">
                            <MessageSquare className="w-4 h-4 text-white/10" />
                         </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                         <Button 
                           type="button"
                           onClick={() => handleReject(selectedProposal.id)}
                           variant="outline" 
                           className="flex-1 h-12 sm:h-14 bg-rose-500/5 hover:bg-rose-500 border-rose-500/20 text-rose-500 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                         >
                           Reject
                         </Button>
                         <Button 
                           type="button"
                           onClick={() => handleApprove(selectedProposal.id)}
                           className="flex-1 h-12 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 border border-emerald-500/50 transition-all"
                         >
                           Approve
                         </Button>
                      </div>
                   </div>
                 ) : (
                   <Button type="button" onClick={() => setShowDetails(false)} className="w-full h-12 sm:h-14 bg-white/[0.03] hover:bg-white/[0.05] text-white/40 hover:text-white border border-white/5 rounded-2xl font-black">
                      Close
                   </Button>
                 )}
                 </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </HRLayout>
    </>
  )
}

function ProposalCard({ proposal, idx, onClick }: { proposal: any; idx: number; onClick: () => void }) {
  const theme = statusTheme[proposal.status] || statusTheme.submitted
  const type = typeTheme[proposal.type] || typeTheme.idea
  const authorInitials = proposal.submittedBy?.name?.slice(0, 2).toUpperCase() || "UN"

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <Card className="border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:bg-white/[0.04] group-hover:-translate-y-1">
        <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${theme.bg} brightness-125 opacity-20 group-hover:opacity-100 transition-opacity`} />
        <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-8">
           <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center p-3 text-white/40 group-hover:text-blue-400 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 transition-all">
                 {React.createElement(type.icon, { className: "w-full h-full" })}
              </div>
              <div className="min-w-0">
                 <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                   {proposal.title}
                 </h3>
                 <div className="flex items-center gap-3 mt-1 text-white/30 font-bold text-[10px] uppercase tracking-widest">
                    <span className="text-white/60">{proposal.submittedBy?.name}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-4 text-white/20">
                 <div className="flex flex-col items-center">
                    <MessageSquare className="w-4 h-4 mb-1" />
                    <span className="text-[8px] font-black">{proposal._count?.comments ?? proposal.comments?.length ?? 0}</span>
                 </div>
                 <div className="w-px h-6 bg-white/5" />
                 <div className="flex flex-col items-center">
                    <Eye className="w-4 h-4 mb-1" />
                    <span className="text-[8px] font-black uppercase">Review</span>
                 </div>
              </div>

              <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] ${theme.bg} ${theme.color} border ${theme.border} group-hover:brightness-125 transition-all`}>
                 {proposal.status}
              </div>

              <button className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                 <ArrowRight className="w-5 h-5 font-black" />
              </button>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
