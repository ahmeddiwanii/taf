import fs from 'fs';
import path from 'path';

function replaceThemeClasses(content: string) {
  return content
    // Replace the main gradients
    .replace(/bg-gradient-to-b from-white via-slate-50 to-slate-100/g, 'bg-[#050505] text-white/90 min-h-screen')
    .replace(/bg-white\/90 backdrop-blur-md border-b border-gray-200/g, 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.08]')
    
    // Header Logo Icon
    .replace(/"w-8 h-8 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 rounded-full"/g, '"w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"')
    
    // Main Cards
    .replace(/className="max-w-4xl w-full shadow-2xl border-0 overflow-hidden rounded-2xl"/g, 'className="max-w-4xl w-full border border-white/[0.08] shadow-2xl bg-[#0a0a0a] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden"')
    .replace(/className="max-w-4xl w-full p-8"/g, 'className="max-w-4xl w-full p-8 border border-white/[0.08] shadow-2xl bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden"')
    .replace(/shadow-lg border-0/g, 'border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-xl rounded-2xl overflow-hidden')
    .replace(/shadow-xl border-0 overflow-hidden rounded-2xl/g, 'border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-xl rounded-3xl overflow-hidden')
    
    // Nested content background areas
    .replace(/bg-gradient-to-r from-gray-50 to-white/g, 'bg-white/[0.02]')
    .replace(/bg-gradient-to-r from-blue-50 to-purple-50/g, 'bg-white/[0.02]')
    .replace(/bg-gradient-to-r from-emerald-50 to-teal-50/g, 'bg-white/[0.02]')
    .replace(/bg-gray-50 text-gray-900/g, 'bg-white/[0.05] text-white')
    .replace(/bg-gray-50/g, 'bg-white/[0.02]')
    .replace(/bg-gray-100/g, 'bg-white/[0.04]')
    
    // Precise BG White exact exact matching
    .replace(/\bbg-white\b(?!\/)/g, 'bg-[#0a0a0a]')
    
    // Borders
    .replace(/\bborder-gray-200\b/g, 'border-white/[0.08]')
    .replace(/\bborder-gray-300\b/g, 'border-white/[0.1]')
    .replace(/\bborder-gray-100\b/g, 'border-white/[0.04]')
    .replace(/\bborder-blue-100\b/g, 'border-blue-500/20')
    .replace(/\bborder-blue-200\b/g, 'border-blue-500/20')
    .replace(/\bborder-blue-500\b/g, 'border-blue-500/40')
    .replace(/\bborder-green-200\b/g, 'border-emerald-500/20')
    .replace(/\bborder-green-500\b/g, 'border-emerald-500/40')
    
    // Exact Text Colors
    .replace(/\btext-gray-900\b/g, 'text-white')
    .replace(/\btext-gray-800\b/g, 'text-white/90')
    .replace(/\btext-gray-700\b/g, 'text-white/70')
    .replace(/\btext-gray-600\b/g, 'text-white/50')
    .replace(/\btext-gray-500\b/g, 'text-white/40')
    .replace(/\btext-gray-400\b/g, 'text-white/30')
    
    // Primary/Accent Text
    .replace(/\btext-blue-800\b/g, 'text-blue-300')
    .replace(/\btext-blue-600\b/g, 'text-blue-400')
    .replace(/\btext-blue-500\b/g, 'text-blue-400')
    .replace(/\btext-green-800\b/g, 'text-emerald-300')
    .replace(/\btext-green-600\b/g, 'text-emerald-400')
    .replace(/\btext-green-500\b/g, 'text-emerald-400')
    .replace(/\btext-purple-600\b/g, 'text-purple-400')
    .replace(/\btext-emerald-600\b/g, 'text-emerald-400')
    
    // Primary/Accent BGs
    .replace(/\bbg-blue-50\b/g, 'bg-blue-500/10')
    .replace(/\bbg-blue-100\b/g, 'bg-blue-500/20')
    .replace(/\bbg-blue-600\b/g, 'bg-blue-600/90 hover:bg-blue-600')
    .replace(/\bbg-green-50\b/g, 'bg-emerald-500/10')
    .replace(/\bbg-green-100\b/g, 'bg-emerald-500/20')
    .replace(/\bbg-purple-50\b/g, 'bg-purple-500/10')
    .replace(/\bbg-emerald-50\b/g, 'bg-emerald-500/10')
    
    // Specific Nav Updates
    .replace(/<div className="flex items-center space-x-2">\s*<div className="w-8 h-8.*?<\/div>\s*<span className="font-semibold.*?>.*?<\/span>\s*<\/div>\s*<UserNav \/>/g, 
    `<div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-black text-white uppercase tracking-widest text-[10px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tafsula Intelligence</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="px-4 py-2 flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.08] text-xs font-bold text-white/70 hover:text-white transition-all uppercase tracking-widest hidden sm:flex">
               <ArrowLeft className="w-3 h-3" /> Return to Mission HQ
            </Link>
            <UserNav />
          </div>`);
}

function processFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Add imports if missing
    if (!content.includes('ArrowLeft')) {
      content = content.replace(/import \{.*?\} from "lucide-react"/, match => {
        return match.replace('}', ', ArrowLeft, Shield }');
      });
    }
    if (!content.includes('import Link')) {
      content = 'import Link from "next/link";\n' + content;
    }

    const newContent = replaceThemeClasses(content);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('Processed', filePath);
  } catch (e) {
    console.error('Failed on', filePath, e);
  }
}

processFile(path.join(__dirname, '../app/test/page.tsx'));
processFile(path.join(__dirname, '../app/test/results/page.tsx'));
