"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import MemberLayout from "../../../../components/layout/member-layout"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Input } from "../../../../components/ui/input"
import { Textarea } from "../../../../components/ui/textarea"
import { motion } from "framer-motion"
import { Shield, Save, User, Activity, ChevronRight, Zap } from "lucide-react"

export default function MemberProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [headline, setHeadline] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [roleTitle, setRoleTitle] = useState("")
  const [experienceJson, setExperienceJson] = useState("")
  const [skillsJson, setSkillsJson] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    if (status === "authenticated" && session?.user?.id) {
      fetchProfile()
    }
  }, [status, session])

  const fetchProfile = async () => {
    const res = await fetch(`/api/profiles/${session?.user?.id}`)
    if (!res.ok) return
    const data = await res.json()
    setProfile(data)
    setHeadline(data.profile?.headline || "")
    setBio(data.profile?.bio || "")
    setLocation(data.profile?.location || "")
    setRoleTitle(data.profile?.roleTitle || "")
    setExperienceJson(data.profile?.experienceJson ? JSON.stringify(data.profile.experienceJson, null, 2) : "")
    setSkillsJson(data.profile?.skillsJson ? JSON.stringify(data.profile.skillsJson, null, 2) : "")
  }

  const saveProfile = async () => {
    setSaving(true)
    await fetch(`/api/profiles/${session?.user?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headline,
        bio,
        location,
        roleTitle,
        experienceJson: experienceJson ? JSON.parse(experienceJson) : undefined,
        skillsJson: skillsJson ? JSON.parse(skillsJson) : undefined,
      }),
    })
    setSaving(false)
    fetchProfile()
  }

  return (
    <MemberLayout>
      <div className="space-y-6 relative z-10 pb-12 w-full max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    My profile
                </h1>
                <p className="text-white/40 font-medium text-xs flex items-center gap-2">
                   <User className="w-4 h-4" /> Who you are in the club
                </p>
            </div>
            <Button 
                onClick={saveProfile} 
                disabled={saving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl border border-blue-500/30 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50"
            >
                {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save profile</>}
            </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
                    
                    <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" /> Basic info
                    </h2>

                    <div className="space-y-5 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Headline</label>
                                <Input 
                                    value={headline} 
                                    onChange={(e) => setHeadline(e.target.value)} 
                                    className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 rounded-xl h-11"
                                    placeholder="Your role at the organization"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Role title</label>
                                <Input 
                                    value={roleTitle} 
                                    onChange={(e) => setRoleTitle(e.target.value)} 
                                    className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 rounded-xl h-11"
                                    placeholder="Senior Engineer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">City / location</label>
                            <Input 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)} 
                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 rounded-xl h-11"
                                placeholder="City or country"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Bio</label>
                            <Textarea 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                                rows={4} 
                                className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 rounded-xl resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                    
                    <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> Work details
                    </h2>

                    <div className="space-y-5 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 flex items-center justify-between">
                                Experience (JSON format)
                                <Badge variant="outline" className="text-[8px] bg-white/5 border-white/10 text-white/30">Admin Only</Badge>
                            </label>
                            <Textarea 
                                value={experienceJson} 
                                onChange={(e) => setExperienceJson(e.target.value)} 
                                rows={4} 
                                className="bg-[#050508] border-white/10 text-emerald-400 font-mono text-[11px] focus-visible:ring-emerald-500 rounded-xl resize-none"
                                placeholder="[ { 'company': '...', 'role': '...' } ]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 flex items-center justify-between">
                                Skills (JSON format)
                                <Badge variant="outline" className="text-[8px] bg-white/5 border-white/10 text-white/30">Admin Only</Badge>
                            </label>
                            <Textarea 
                                value={skillsJson} 
                                onChange={(e) => setSkillsJson(e.target.value)} 
                                rows={3} 
                                className="bg-[#050508] border-white/10 text-emerald-400 font-mono text-[11px] focus-visible:ring-emerald-500 rounded-xl resize-none"
                                placeholder="[ 'React', 'TypeScript', 'Node.js' ]"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3 p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent"
                >
                  <a href="/auth/forgot-password" className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                        <Zap className="h-4 w-4 text-white/40 group-hover:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white">Password</h4>
                        <p className="text-[10px] text-white/30">Reset via email</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20" />
                  </a>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-left text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
                    onClick={async () => {
                      if (!confirm("Deactivate your account? You will be signed out.")) return
                      const res = await fetch("/api/users/deactivate", { method: "POST" })
                      if (res.ok) {
                        const { signOut } = await import("next-auth/react")
                        await signOut({ callbackUrl: "/" })
                      }
                    }}
                  >
                    Deactivate account
                  </button>
                </motion.div>
            </div>
        </div>
      </div>
    </MemberLayout>
  )
}


