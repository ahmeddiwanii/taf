import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../app/test/results/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Match against the dynamic return block where the layout starts
const match = content.match(/  const PersonalityIcon = personalityStory\.icon\r?\n\r?\n  return \(/);

if (!match) {
  console.error("Pivot not found!");
  process.exit(1);
}

const pivotIndex = match.index;
const beforeReturn = content.substring(0, pivotIndex + match[0].length);

const newReturnJSX = `
    <div className="min-h-screen bg-[#050505] text-white/90 relative selection:bg-blue-500/30 selection:text-white">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 transition-colors duration-1000" 
           style={{ background: \`radial-gradient(circle at 50% 0%, \$\{personalityStory.color\}40, transparent 70%)\` }} />
      
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.08] shadow-lg">
              <Shield className="w-4 h-4 text-white/70" style={{ color: personalityStory.color }} />
            </div>
            <span className="font-black text-white uppercase tracking-widest text-[10px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tafsula Intelligence</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/dashboard" className="px-3 sm:px-4 py-2 flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.08] text-xs font-bold text-white/70 hover:text-white transition-all uppercase tracking-widest">
               <ArrowLeft className="w-3 h-3 hidden sm:block" /> Exit
            </Link>
            <UserNav />
          </div>
        </div>
      </header>

      {/* Celebration Animation overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="bg-[#0a0a0a] border border-white/[0.08] rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm mx-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: \`\$\{personalityStory.color\}20\`, border: \`1px solid \$\{personalityStory.color\}50\` }}>
                <PersonalityIcon className="h-10 w-10 animate-pulse" style={{ color: personalityStory.color }} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Profile Secured</h2>
              <p className="text-white/50 text-sm font-medium">Decrypting your cognitive matrix...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 block">
        
        {/* Cover Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-12 sm:mb-20">
          <Card className="overflow-hidden border border-white/[0.08] bg-[#0a0a0a]/50 backdrop-blur-3xl shadow-2xl rounded-[2rem] sm:rounded-[3rem]">
            <CardContent className="p-0">
              <div className="relative p-8 sm:p-16 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ background: \`linear-gradient(135deg, \$\{personalityStory.color\}dd, transparent)\` }} />
                
                <motion.div initial={{ scale: 0.8, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.2 }} className="relative z-10 mb-8">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3" style={{ backgroundColor: \`\$\{personalityStory.color\}15\`, border: \`2px solid \$\{personalityStory.color\}50\` }}>
                    <PersonalityIcon className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: personalityStory.color }} />
                  </div>
                </motion.div>
                
                <div className="relative z-10 max-w-3xl">
                  <Badge className="mb-6 bg-white/[0.05] text-white/80 border border-white/[0.1] px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                    Codename: {result.dominantType}
                  </Badge>
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    The {personalityStory.title}
                  </h1>
                  <p className="text-lg sm:text-2xl text-white/70 font-medium leading-relaxed max-w-2xl mx-auto">
                    {personalityStory.superpower}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-white/[0.08] bg-black/40 p-6 sm:p-8">
                 <div className="flex flex-wrap justify-center gap-3">
                   {personalityStory.traits.map((trait, i) => (
                     <Badge key={i} variant="outline" className="text-xs font-bold text-white/60 border-white/[0.1] bg-white/[0.02] px-4 py-2 uppercase tracking-widest rounded-xl hover:bg-white/[0.05] transition-colors">{trait}</Badge>
                   ))}
                 </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Intelligence Breakdown & Narrative Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 items-start">
           
           {/* MOBILE STICKY NAV */}
           <div className="lg:hidden sticky top-20 z-40 bg-[#050505]/95 backdrop-blur-xl border-y border-white/[0.08] -mx-4 px-4 py-3 mb-8 overflow-x-auto no-scrollbar shadow-2xl shadow-black">
              <div className="flex gap-2 w-max">
                 {personalityStory.chapters.map((chapter, index) => {
                    const isActive = currentChapter === index;
                    return (
                      <button key={chapter.title} onClick={() => scrollToChapter(index)} className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider \$\{isActive ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"\}\`}>
                         {chapter.title.split(":")[0]}
                      </button>
                    )
                 })}
              </div>
           </div>

           {/* DESKTOP STICKY SIDEBAR */}
           <div className="hidden lg:block lg:col-span-3 sticky top-32">
              <div className="space-y-8">
                 <div>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 pl-2">Executive Summary</h4>
                    <div className="space-y-1 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-white/[0.05]">
                      {personalityStory.chapters.map((chapter, index) => {
                         const isActive = currentChapter === index;
                         return (
                           <button key={chapter.title} onClick={() => scrollToChapter(index)} className={\`w-full flex items-center text-left py-3 px-2 group transition-all relative z-10 \$\{isActive ? "" : "opacity-50 hover:opacity-100"\}\`}>
                             <div className={\`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-4 transition-all duration-300 \$\{isActive ? "bg-white text-[#050505] scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "bg-[#0a0a0a] border border-white/[0.2] text-white/50 group-hover:border-white/50"\}\`}>
                               <span className="text-[10px] font-black">{index + 1}</span>
                             </div>
                             <div>
                               <p className={\`text-xs font-black uppercase tracking-widest transition-colors \$\{isActive ? "text-white" : "text-white/60 group-hover:text-white/90"\}\`}>
                                 {chapter.title.split(":")[0]}
                               </p>
                               <p className="text-[10px] text-white/40 font-medium truncate max-w-[160px]">{chapter.title.split(":")[1]?.trim()}</p>
                             </div>
                           </button>
                         )
                      })}
                    </div>
                 </div>

                 <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden mt-10">
                   <CardContent className="p-6">
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Core Competencies</h4>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1 mb-4">
                           <strong className="block text-[10px] text-white/40 uppercase tracking-widest">Comm Style</strong>
                           <div className="flex items-start gap-3">
                             <MessageCircle className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                             <p className="text-xs font-semibold text-white/80 leading-relaxed">{personalityStory.communication}</p>
                           </div>
                        </div>
                        <div className="flex flex-col gap-1 mb-4">
                           <strong className="block text-[10px] text-white/40 uppercase tracking-widest">Work Style</strong>
                           <div className="flex items-start gap-3">
                             <Target className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                             <p className="text-xs font-semibold text-white/80 leading-relaxed">{personalityStory.workStyle}</p>
                           </div>
                        </div>
                        <div className="flex flex-col gap-1">
                           <strong className="block text-[10px] text-white/40 uppercase tracking-widest">Team Role</strong>
                           <div className="flex items-start gap-3">
                             <Users className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                             <p className="text-xs font-semibold text-white/80 leading-relaxed">{personalityStory.teamRole}</p>
                           </div>
                        </div>
                      </div>
                   </CardContent>
                 </Card>
              </div>
           </div>

           {/* MAIN NARRATIVE CONTENT */}
           <div className="lg:col-span-9 space-y-16 lg:space-y-32">
              {personalityStory.chapters.map((chapter, index) => {
                 const ChapterIcon = chapter.icon;
                 return (
                   <div key={index} id={\`chapter-\$\{index\}\`} className="scroll-mt-40">
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/80 shadow-lg shrink-0">
                              <ChapterIcon className="w-6 h-6" style={{ color: personalityStory.color }} />
                           </div>
                           <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {chapter.title.includes(":") ? chapter.title.split(":")[1].trim() : chapter.title}
                           </h2>
                        </div>
                        
                        <Card className="border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-xl rounded-[2rem] overflow-hidden">
                           <CardContent className="p-6 sm:p-10">
                              <div className="prose prose-invert prose-lg max-w-none prose-p:text-white/70 prose-p:leading-loose prose-p:md:text-lg prose-p:mb-6 last:prose-p:mb-0 prose-strong:text-white" dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\\n\\n/g, "</p><p>") }} />
                           </CardContent>
                        </Card>
                      </motion.div>
                   </div>
                 )
              })}

              {/* DISC RAW SCORES MATRIX */}
              <div id="chapter-matrix" className="pt-10 border-t border-white/[0.08]">
                 <h3 className="text-xl font-black text-white/40 uppercase tracking-[0.2em] mb-10 text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Raw Intelligence Matrix</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                   {[
                      { type: "D", score: Math.round(result.dScore), color: "#f43f5e", label: "Dominance" },
                      { type: "I", score: Math.round(result.iScore), color: "#f59e0b", label: "Influence" },
                      { type: "S", score: Math.round(result.sScore), color: "#10b981", label: "Steadiness" },
                      { type: "C", score: Math.round(result.cScore), color: "#3b82f6", label: "Conscientious" },
                    ].map((item, index) => {
                      const isHighest = item.type === result.dominantType;
                      return (
                        <Card key={item.type} className={\`border bg-[#0a0a0a] rounded-[2rem] text-center overflow-hidden transition-all duration-500 flex flex-col justify-center \$\{isHighest ? "border-white/[0.3] shadow-[0_0_30px_rgba(255,255,255,0.05)] scale-105 relative z-10" : "border-white/[0.05] opacity-60 hover:opacity-100"\}\`}>
                          <CardContent className="p-6">
                             <div className="text-5xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: item.color }}>{item.type}</div>
                             <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 break-words">{item.label}</div>
                             <div className="text-2xl font-bold text-white mb-2">{item.score}%</div>
                             <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} whileInView={{ width: \`\$\{item.score\}%\` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + (index*0.1) }} className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                             </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                 </div>
              </div>

              {/* Action Modules */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-10 pb-20">
                 <Button onClick={() => router.push("/test")} variant="outline" className="h-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:text-white text-white/50 font-bold uppercase tracking-widest text-[10px] cursor-pointer">
                   <RefreshCw className="w-4 h-4 mr-3" /> Recalibrate
                 </Button>
                 <Button variant="outline" className="h-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:text-white text-white/50 font-bold uppercase tracking-widest text-[10px] cursor-pointer">
                   <Share2 className="w-4 h-4 mr-3" /> Export Intel
                 </Button>
                 <Button onClick={() => router.push("/dashboard")} className="h-16 rounded-2xl border border-white bg-white text-[#050505] hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] font-black uppercase tracking-widest text-[10px] sm:col-span-2 lg:col-span-1 cursor-pointer">
                   Mission HQ <ArrowLeft className="w-4 h-4 ml-3 rotate-180" />
                 </Button>
              </div>

           </div>
        </div>
      </div>
    </div>
  )
}
`;

content = beforeReturn + newReturnJSX;
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected exact layout logic over return block!');
