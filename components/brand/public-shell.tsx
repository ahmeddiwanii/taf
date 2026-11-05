"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { Menu, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { UserNav } from "@/components/user-nav"
import { LocaleSwitcher, useLocale } from "@/lib/i18n/locale-context"
import { LogoWordmark } from "@/components/brand/logo"

export function PublicShell({
  children,
  dark = false,
  cinematic = false,
}: {
  children: ReactNode
  dark?: boolean
  cinematic?: boolean
}) {
  const { data: session, status } = useSession()
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  const showAccount = mounted && status !== "loading"
  const lightNav = dark

  const links = [
    { href: "/organizations", label: t("nav.clubs") },
    { href: "/events", label: t("nav.events") },
    { href: "/about", label: t("nav.about") },
  ]

  return (
    <div className={`relative min-h-screen ${cinematic || dark ? "bg-[#07080c] text-jasmine" : "bg-jasmine text-soot"}`}>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b-[3px] transition-shadow duration-300 ${
          lightNav ? "border-white/10 bg-soot text-jasmine" : "border-soot bg-jasmine text-soot"
        } ${scrolled ? "shadow-[0_10px_30px_rgba(22,18,16,0.16)]" : ""}`}
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <LogoWordmark />
          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[15px] font-medium no-underline ${
                  lightNav ? "text-jasmine/75 hover:text-jasmine" : "text-soot/70 hover:text-soot"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LocaleSwitcher inverted={lightNav} className="hidden sm:inline-flex" />
            {showAccount && session ? (
              <UserNav variant={lightNav ? "dark" : "light"} />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`hidden text-[14px] font-medium no-underline sm:block ${lightNav ? "text-jasmine/80 hover:text-jasmine" : "text-soot/70 hover:text-soot"}`}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/organizations"
                  className={
                    lightNav
                      ? "rounded-full bg-jasmine px-5 py-2.5 text-[13px] font-semibold text-soot no-underline"
                      : "rounded-full bg-soot px-5 py-2.5 text-[13px] font-semibold text-jasmine no-underline shadow-[3px_4px_0_0_#9C1C28]"
                  }
                >
                  {t("cta.exploreClubs")}
                </Link>
              </>
            )}
            <button type="button" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className={`space-y-1 border-t-[2px] px-4 py-3 md:hidden ${lightNav ? "border-white/10 bg-soot" : "border-soot/10 bg-jasmine"}`}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-lg px-2 py-2 text-sm no-underline" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <LocaleSwitcher inverted={lightNav} />
          </div>
        )}
      </header>
      <div className="pt-20">{children}</div>
    </div>
  )
}
