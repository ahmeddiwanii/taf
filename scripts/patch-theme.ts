import fs from 'fs';
import path from 'path';

function replaceThemeClasses(content: string) {
  return content
    // Backgrounds
    .replace(/bg-gradient-to-b from-white via-slate-50 to-slate-100/g, 'bg-[#050505] text-white/90 min-h-screen')
    .replace(/bg-white\/90 backdrop-blur-md border-b border-gray-200/g, 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.08]')
    
    // Cards
    .replace(/shadow-lg border-0/g, 'border border-white/[0.08] shadow-2xl bg-white/[0.02] backdrop-blur-xl rounded-2xl overflow-hidden')
    .replace(/bg-gradient-to-r from-gray-50 to-white border-gray-200/g, 'bg-white/[0.02] border-white/[0.08] backdrop-blur-xl rounded-2xl')
    .replace(/bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/g, 'bg-[#0a0a0a] border-white/[0.08] rounded-2xl')
    .replace(/bg-blue-50 border border-blue-200/g, 'bg-blue-500/10 border-blue-500/20')
    .replace(/text-blue-800/g, 'text-blue-400')
    
    // Text colors
    .replace(/text-gray-900/g, 'text-white')
    .replace(/text-gray-800/g, 'text-white/90')
    .replace(/text-gray-700/g, 'text-white/80')
    .replace(/text-gray-600/g, 'text-white/60')
    .replace(/text-gray-500/g, 'text-white/40')
    .replace(/text-gray-400/g, 'text-white/30')
    
    // Elements & Borders
    .replace(/bg-gray-200 border-gray-300 hover:border-gray-400/g, 'bg-white/[0.05] border-white/[0.1] hover:border-white/[0.3]')
    .replace(/bg-gray-100/g, 'bg-white/[0.05]')
    .replace(/bg-white/g, 'bg-[#050505]')
    .replace(/hover:bg-gray-50/g, 'hover:bg-white/[0.05]')
    .replace(/border-gray-200/g, 'border-white/[0.08]')
    .replace(/border-gray-300/g, 'border-white/[0.15]')
    
    // Test specific highlights
    .replace(/bg-blue-100/g, 'bg-blue-500/20')
    .replace(/bg-green-100/g, 'bg-emerald-500/20')
    .replace(/bg-purple-100/g, 'bg-purple-500/20')
    .replace(/text-blue-600/g, 'text-blue-400')
    .replace(/text-green-600/g, 'text-emerald-400')
    .replace(/bg-blue-600/g, 'bg-blue-600/80')
    .replace(/hover:text-gray-900/g, 'hover:text-white')
    
    // Headers & Fonts
    .replace(/font-bold/g, 'font-bold tracking-tight')

    // Fix the logo "Personality Assessment"
    .replace(/"w-8 h-8 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-blue-500 rounded-full"/g, '"w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"')
    .replace(/"w-8 h-8 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 rounded-full"/g, '"w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"');
}

function processFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const newContent = replaceThemeClasses(content);
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log('Processed', filePath);
}

processFile(path.join(__dirname, '../app/test/page.tsx'));
processFile(path.join(__dirname, '../app/test/results/page.tsx'));
