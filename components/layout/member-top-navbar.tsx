"use client"

import React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { UserAvatar } from "../user-avatar"
import {
  Menu as MenuIcon,
  Bell as BellIcon,
  Search as SearchIcon,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MemberTopNavProps {
  organizationName: string
  onMenuAction: () => void
}

export function MemberTopNav({ organizationName, onMenuAction }: MemberTopNavProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-30 w-full border-b-[2.5px] border-soot/10 bg-jasmine/90 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuAction}
            className="md:hidden p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white transition-all"
            type="button"
            aria-label="Open menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-black text-white text-xs">T</span>
            </div>
            <span
              className="font-black text-sm text-white tracking-tighter uppercase truncate max-w-[140px]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {organizationName.split(" ")[0]}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] group focus-within:border-blue-500/30 transition-all">
            <SearchIcon className="w-3.5 h-3.5 text-white/20 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="search"
              placeholder="Search in your workspace…"
              className="bg-transparent border-none outline-none text-[11px] font-medium text-white/70 placeholder:text-white/25 w-56 max-w-[40vw]"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex flex-col items-end pr-4 border-r border-white/5">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Signed in</span>
            <span className="text-[9px] font-bold text-white/25 uppercase tracking-tighter truncate max-w-[160px]">
              {session?.user?.email}
            </span>
          </div>

          <button
            type="button"
            className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            aria-label="Notifications (coming soon)"
          >
            <BellIcon className="w-4 h-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-white/5 rounded-xl py-1 pr-1 hover:bg-white/[0.04] transition-colors text-left"
              >
                <div className="text-right hidden min-[400px]:block">
                  <p
                    className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[140px]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {session?.user?.name}
                  </p>
                  <p className="text-[8px] font-bold text-blue-400/70 uppercase tracking-widest">Member</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="ring-2 ring-blue-500/20 rounded-full p-0.5">
                    <UserAvatar avatarId={(session?.user as any)?.avatarId} name={session?.user?.name} size="sm" />
                  </div>
                  <ChevronDown className="w-3 h-3 text-white/30 hidden sm:block" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#0c0c12] border border-white/10 text-white shadow-2xl rounded-xl"
            >
              <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                <Link href="/dashboard/member/profile" className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-blue-400" />
                  My profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="focus:bg-rose-500/15 focus:text-rose-300 text-rose-300/90 cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                <LogOut className="w-4 h-4 mr-2 inline" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
