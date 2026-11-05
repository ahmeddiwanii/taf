"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { FIGURINES, getFigurine, type FigurineId } from "@/lib/brand"

interface FigurineProps {
  id?: number | null
  size?: "sm" | "md" | "lg" | "hero"
  animate?: boolean
  showLabel?: boolean
  className?: string
}

const sizeMap = {
  sm: { box: "h-11 w-11", glyph: "text-sm", cap: "h-6 w-6", body: "h-5 w-7" },
  md: { box: "h-[4.5rem] w-[4.5rem]", glyph: "text-lg", cap: "h-9 w-9", body: "h-8 w-11" },
  lg: { box: "h-28 w-28", glyph: "text-2xl", cap: "h-14 w-14", body: "h-12 w-[4.5rem]" },
  hero: { box: "h-44 w-44 md:h-52 md:w-52", glyph: "text-4xl", cap: "h-20 w-20", body: "h-16 w-28" },
}

/** Sculpted companion: clay head + copper body + Arabic craft mark. Swap for GLB later. */
export function FigurineBuddy({
  id = 1,
  size = "md",
  animate = true,
  showLabel = false,
  className = "",
}: FigurineProps) {
  const f = getFigurine(id)
  const s = sizeMap[size]

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.div
        className={`relative ${s.box} flex flex-col items-center justify-end`}
        animate={animate ? { y: [0, -7, 0], rotateZ: [-1.5, 1.5, -1.5] } : undefined}
        transition={animate ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" } : undefined}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-x-3 bottom-0 h-2 rounded-full bg-black/40 blur-md" aria-hidden />
        <div
          className={`${s.cap} z-10 flex items-center justify-center rounded-full`}
          style={{
            background: `radial-gradient(circle at 30% 25%, #F7F3EA 0%, ${f.color} 42%, #161210 100%)`,
            boxShadow: `6px 10px 0 rgba(0,0,0,0.25), inset -6px -8px 12px rgba(0,0,0,0.35)`,
            transform: "rotateX(12deg)",
          }}
        >
          <span className={`${s.glyph} select-none font-display text-jasmine`} style={{ fontFamily: "Fraunces, serif" }}>
            {f.glyph}
          </span>
        </div>
        <div
          className={`${s.body} -mt-1 rounded-[40%_40%_32%_32%]`}
          style={{
            background: `linear-gradient(160deg, ${f.color} 0%, #161210 100%)`,
            boxShadow: `0 14px 24px ${f.color}55`,
            transform: "perspective(240px) rotateX(18deg)",
          }}
        />
      </motion.div>
      {showLabel && (
        <div className="text-center">
          <p className="font-display text-sm text-jasmine" style={{ fontFamily: "Fraunces, serif" }}>
            {f.name}
          </p>
        </div>
      )}
    </div>
  )
}

export function FigurinePicker({
  value,
  onChange,
  title = "Pick your companion",
}: {
  value?: number
  onChange: (id: FigurineId) => void
  title?: string
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-jasmine" style={{ fontFamily: "Fraunces, serif" }}>
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FIGURINES.map((f) => {
          const selected = value === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              className={`rounded-2xl border p-3 transition ${
                selected ? "border-saffron/60 bg-jasmine/5" : "border-jasmine/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <FigurineBuddy id={f.id} size="md" showLabel animate={selected} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function EmptyStateWithBuddy({
  figurineId = 1,
  message,
  action,
}: {
  figurineId?: number
  message: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-jasmine/15 bg-white/[0.02] px-6 py-12 text-center">
      <FigurineBuddy id={figurineId} size="lg" />
      <p className="max-w-sm text-sm text-jasmine/60">{message}</p>
      {action}
    </div>
  )
}
