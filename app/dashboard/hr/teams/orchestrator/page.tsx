"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { HRLayout } from "@/components/layout/hr-layout"
import { 
  Users, 
  Search, 
  ArrowLeft, 
  Shield, 
  Plus, 
  Target, 
  ChevronRight,
  UserPlus,
  Trash2,
  Settings,
  Rocket,
  Zap,
  MoreVertical
} from "lucide-react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatarId: number
  teams?: string[] // IDs of teams they belong to
}

interface TeamMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    avatarId: number
  }
}

interface Team {
  id: string
  name: string
  purpose: string
  members: TeamMember[]
  directors: { userId: string; user: { name: string } }[]
}

export default function SquadOrchestrator() {
  const router = useRouter()
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedUser, setDraggedUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<"pool" | "squads">("pool")

  useEffect(() => {
    if (session?.user?.organizationId) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [usersRes, teamsRes] = await Promise.all([
        fetch(`/api/users?organizationId=${session?.user.organizationId}`),
        fetch(`/api/teams?organizationId=${session?.user.organizationId}`)
      ])
      
      const usersData = await usersRes.json()
      const teamsData = await teamsRes.json()
      
      setUsers(usersData)
      setTeams(teamsData?.teams || (Array.isArray(teamsData) ? teamsData : []))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setLoading(false)
    }
  }

  const handleAssignToTeam = async (userId: string, teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Assignment error:", error)
    }
  }

  const handleRemoveFromTeam = async (userId: string, teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Removal error:", error)
    }
  }

  const handleToggleDirector = async (userId: string, teamId: string, isDirector: boolean) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/directors`, {
        method: isDirector ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Director toggle error:", error)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return null

  return (
    <HRLayout orgName={session?.user.name || "Organization"}>
      <div className="flex flex-col h-[calc(100vh-160px)] relative z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4 -ml-4 text-white/40 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Intelligence
            </Button>
            <h1 className="text-5xl font-black text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              SQUAD <span className="text-blue-500">ORCHESTRATOR</span>
            </h1>
            <p className="text-white/40 font-medium tracking-wide mt-1">Reactive human capital deployment and unit structuring</p>
          </div>
          
          <div className="flex gap-4">
            <div className="h-14 w-64 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center px-4 group focus-within:border-blue-500/50 transition-all">
              <Search className="w-5 h-5 text-white/20 group-focus-within:text-blue-500" />
              <input 
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-white text-sm ml-3 w-full"
              />
            </div>
            <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 border border-blue-500/30">
              <Zap className="w-5 h-5 mr-2" /> OPTIMIZE
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-8 overflow-hidden">
          {/* Force Pool (Left) */}
          <div className="w-80 flex flex-col bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-white/[0.05] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">FORCE POOL</span>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{filteredUsers.length} ASSETS</Badge>
              </div>
              <p className="text-xs text-white/20">Drag assets to deploy into squads</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredUsers.map(user => (
                <DraggableUserCard 
                  key={user.id} 
                  user={user} 
                  onDragStart={() => setDraggedUser(user)}
                  onDragEnd={() => setDraggedUser(null)}
                  isAssigned={teams.some(t => t.members.some(m => m.userId === user.id))}
                />
              ))}
            </div>
          </div>

          {/* Squad Grid (Right) */}
          <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar pb-12">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {teams.map(team => (
                <SquadUnit 
                  key={team.id} 
                  team={team} 
                  onDrop={() => draggedUser && handleAssignToTeam(draggedUser.id, team.id)}
                  onRemoveMember={(userId) => handleRemoveFromTeam(userId, team.id)}
                  onToggleDirector={(userId, isDir) => handleToggleDirector(userId, team.id, isDir)}
                />
              ))}
              
              <button 
                onClick={() => router.push('/dashboard/hr/teams')}
                className="h-[400px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center group hover:bg-white/[0.02] hover:border-blue-500/20 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-white/20 group-hover:text-blue-500" />
                </div>
                <p className="text-white/20 font-black uppercase tracking-widest mt-4">Initialize New Squad</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  )
}

function DraggableUserCard({ user, onDragStart, onDragEnd, isAssigned }: { user: User, onDragStart: () => void, onDragEnd: () => void, isAssigned: boolean }) {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-4 cursor-grab active:cursor-grabbing group ${isAssigned ? 'opacity-60' : ''}`}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
        {user.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white truncate">{user.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
           <span className="text-[10px] text-white/30 font-bold uppercase truncate">{user.email}</span>
           {isAssigned && <div className="w-1 h-1 rounded-full bg-blue-500" />}
        </div>
      </div>
      <Badge className="bg-white/5 text-white/40 text-[8px] font-black border-none uppercase tracking-tighter">
        {user.role}
      </Badge>
    </motion.div>
  )
}

function SquadUnit({ team, onDrop, onRemoveMember, onToggleDirector }: { team: Team, onDrop: () => void, onRemoveMember: (id: string) => void, onToggleDirector: (id: string, isDir: boolean) => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onViewportEnter={() => setIsHovered(true)}
      onViewportLeave={() => setIsHovered(false)}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
      onDrop={(e) => { e.preventDefault(); onDrop(); setIsHovered(false); }}
      className={`relative rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden flex flex-col h-[450px] ${
        isHovered 
        ? 'border-blue-500/50 bg-blue-500/[0.03] shadow-[0_0_50px_rgba(59,130,246,0.1)]' 
        : 'border-white/[0.08] bg-white/[0.02]'
      }`}
    >
      {/* Background Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Squad Header */}
      <div className="p-8 pb-4 relative z-10 flex items-start justify-between">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <div className={`w-3 h-3 rounded-full ${isHovered ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-white/20'} transition-all`} />
              <h3 className="text-3xl font-black text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{team.name}</h3>
           </div>
           <p className="text-white/40 text-sm font-medium italic">{team.purpose}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group">
           <Rocket className={`w-6 h-6 transition-transform duration-500 ${isHovered ? 'text-blue-500 scale-110 -rotate-12' : ''}`} />
        </div>
      </div>

      {/* Directors Section */}
      <div className="px-8 mb-4 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">OPERATIONAL COMMAND</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {team.directors.map(dir => (
            <Badge key={dir.userId} className="h-8 pl-1 pr-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-black">
                 {dir.user.name[0]}
               </div>
               <span className="text-[10px] font-black">{dir.user.name.split(' ')[0]}</span>
               <button onClick={() => onToggleDirector(dir.userId, true)} className="hover:text-white">×</button>
            </Badge>
          ))}
          {team.directors.length === 0 && <span className="text-[10px] text-white/10 italic">No directors assigned</span>}
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3 custom-scrollbar relative z-10">
         <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">UNIT PERSONNEL</span>
            <span className="text-[10px] font-black text-white/20">{team.members.length} UNITS</span>
         </div>
         
         {team.members.map(member => (
           <motion.div 
             key={member.id}
             layout
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             className="group/member p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3 hover:bg-white/5 transition-all"
           >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-white/60 font-bold border border-white/5">
                {member.user.name[0]}
              </div>
              <div className="flex-1">
                 <p className="text-xs font-black text-white/80">{member.user.name}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/member:opacity-100 transition-opacity">
                 <button 
                   onClick={() => onToggleDirector(member.userId, team.directors.some(d => d.userId === member.userId))}
                   className={`p-1.5 rounded-lg transition-colors ${team.directors.some(d => d.userId === member.userId) ? 'text-blue-500' : 'text-white/20 hover:text-blue-400'}`}
                   title="Toggle Director"
                 >
                    <Shield className="w-3.5 h-3.5" />
                 </button>
                 <button 
                   onClick={() => onRemoveMember(member.userId)}
                   className="p-1.5 rounded-lg text-white/20 hover:text-red-400 transition-colors"
                   title="Remove"
                 >
                    <Trash2 className="w-3.5 h-3.5" />
                 </button>
              </div>
           </motion.div>
         ))}

         {team.members.length === 0 && (
           <div className="h-40 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-30">
              <UserPlus className="w-8 h-8 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Awaiting Deployment<br/>Drop Asset Here</p>
           </div>
         )}
      </div>

      {/* Footer Branding */}
      <div className="p-6 bg-white/[0.02] border-t border-white/[0.05] flex justify-between items-center relative z-10">
         <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">ALPHA NEXUS CORE</span>
         <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500/10" />)}
         </div>
      </div>
    </motion.div>
  )
}
