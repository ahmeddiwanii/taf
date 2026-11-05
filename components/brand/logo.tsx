"use client"

import Link from "next/link"
import Image from "next/image"

export function LogoMark({
  className = "h-9 w-9",
  title = "Tafsula",
  animated = true,
}: {
  className?: string
  title?: string
  animated?: boolean
}) {
  return (
    <span className={`relative inline-flex ${className}`} title={title}>
      <span className="pointer-events-none absolute inset-0 rounded-[22%] bg-saffron/30 blur-[6px] taf-logo-glow" />
      <Image
        src="/brand/logo.png"
        alt={title}
        width={128}
        height={128}
        priority
        className={`relative h-full w-full rounded-[22%] object-cover shadow-[2px_3px_0_0_#9C1C28] ${
          animated ? "taf-logo-spin" : ""
        }`}
      />
    </span>
  )
}

export function LogoWordmark({
  href = "/",
  compact = false,
}: {
  href?: string
  light?: boolean
  compact?: boolean
}) {
  const word = (
    <Image
      src="/brand/logo-nav.png"
      alt="Tafsula"
      width={888}
      height={341}
      priority
      className={`w-auto object-contain ${compact ? "h-10" : "h-12 sm:h-14"}`}
    />
  )
  if (!href) return word
  return (
    <Link href={href} className="inline-flex no-underline hover:opacity-90">
      {word}
    </Link>
  )
}
