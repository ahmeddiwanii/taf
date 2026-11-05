"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowRight, DoorOpen, Heart, Play, Sparkles, Users } from "lucide-react"
import { PublicShell } from "@/components/brand/public-shell"
import { LogoMark } from "@/components/brand/logo"
import { BureauMock, MemberMock } from "@/components/brand/device-mocks"
import { BrandFigure } from "@/components/brand/figures"
import { InviteMascot } from "@/components/brand/invite-mascot"
import { landingCopy } from "@/lib/landing-copy"
import { useLocale } from "@/lib/i18n/locale-context"

export default function Home() {
  const { locale, t } = useLocale()
  const copy = landingCopy[locale]
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const display = { fontFamily: "Fraunces, serif" }

  return (
    <PublicShell cinematic>
      <section className="relative isolate h-[calc(100svh-5rem)] min-h-[calc(100svh-5rem)] overflow-hidden text-white">
        <img
          src="/brand/hero-portal.png"
          alt=""
          width={3344}
          height={1882}
          className="pointer-events-none absolute inset-0 h-full w-full max-w-none select-none object-cover object-center"
          decoding="sync"
          fetchPriority="high"
          draggable={false}
        />

        <div className="relative z-10 mx-auto flex h-full min-h-[calc(100svh-5rem)] w-full max-w-[1280px] flex-col px-5 sm:px-8 lg:px-10">
          <div className="flex min-h-0 flex-1 flex-col justify-start pt-8 sm:pt-10 lg:pt-12">
            <motion.div
              className="w-full max-w-[32rem] lg:max-w-[34rem]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
                <span aria-hidden>🚀</span>
                {copy.kicker}
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E31C23] text-[9px] leading-none" aria-hidden>
                  🇹🇳
                </span>
              </p>

              <h1 className="text-white" style={{ textShadow: "0 2px 22px rgba(0,0,0,0.45)" }}>
                <span
                  className="block text-[2.65rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-[3.35rem] lg:text-[3.85rem]"
                  style={{ fontFamily: "Figtree, sans-serif" }}
                >
                  {copy.heroLine1}
                </span>
                <span className="relative inline-block">
                  <span
                    className="block text-[2.65rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-[3.35rem] lg:text-[3.85rem]"
                    style={{ fontFamily: "Figtree, sans-serif" }}
                  >
                    {copy.heroLine2}
                  </span>
                  <svg
                    className="absolute -right-7 top-1 hidden h-6 w-6 sm:block lg:-right-8 lg:top-2"
                    viewBox="0 0 24 24"
                    fill="#E8B84A"
                    aria-hidden
                  >
                    <path d="M12 0 13.8 8.6 22 12 13.8 15.4 12 24 10.2 15.4 2 12l8.2-3.4Z" />
                  </svg>
                </span>
                <span
                  className="mt-1 block text-[2.15rem] italic leading-[1.02] sm:text-[2.7rem] lg:text-[3.15rem]"
                  style={{ fontFamily: "Fraunces, serif", color: "#E07A6A" }}
                >
                  {copy.heroAccent}
                </span>
                <span
                  className="block text-[2.15rem] italic leading-[1.02] text-white sm:text-[2.7rem] lg:text-[3.15rem]"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {copy.heroAfter}
                </span>
              </h1>

              <p
                className="mt-5 max-w-[26.5rem] text-[13.5px] leading-[1.55] text-white/85 sm:text-[14.5px]"
                style={{ textShadow: "0 1px 14px rgba(0,0,0,0.5)" }}
              >
                {copy.heroSub}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/organizations"
                  className="inline-flex items-center gap-2.5 rounded-full bg-pomegranate py-2.5 pl-2.5 pr-5 text-sm font-semibold text-white no-underline shadow-[0_0_28px_rgba(196,60,50,0.5)]"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/25">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  {copy.ctaPrimary}
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2.5 rounded-full bg-black/75 py-2.5 pl-2.5 pr-5 text-sm font-semibold text-white no-underline ring-1 ring-white/10"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Play className="h-3 w-3 fill-white" />
                  </span>
                  {copy.ctaWatch}
                </a>
              </div>
            </motion.div>
          </div>

          <div className="mt-auto pb-5 pt-8 sm:pb-6">
            <div className="grid grid-cols-2 overflow-hidden rounded-[1.7rem] border border-white/12 bg-black/40 sm:grid-cols-4 sm:rounded-full">
              {copy.stats.map((s, i) => {
                const Icon = [Users, DoorOpen, Sparkles, Heart][i] ?? Users
                return (
                  <motion.div
                    key={s.n}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.45 }}
                    className={`group flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-[1.15rem] ${
                      i > 0 ? "sm:border-l sm:border-white/10" : ""
                    }`}
                  >
                    <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition group-hover:bg-amber-200/10 group-hover:ring-amber-200/30">
                      <Icon className="h-4 w-4 text-white/75 transition group-hover:text-amber-200" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[1.15rem] leading-none text-white" style={display}>
                        {s.n}
                      </p>
                      <p className="mt-1.5 truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/45">
                        {s.l}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden bg-jasmine text-soot">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)", top: "-2%", left: "-8%" }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[400px] w-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(241,178,74,0.16) 0%, transparent 70%)", top: "22%", right: "-6%" }}
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[450px] w-[450px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,167,125,0.12) 0%, transparent 70%)", top: "52%", left: "18%" }}
            animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[350px] w-[350px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(31,119,180,0.14) 0%, transparent 70%)", bottom: "6%", right: "8%" }}
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <p className="mb-5 inline-flex rounded-full border-[2px] border-soot px-3.5 py-1.5 text-[12px] font-semibold text-soot">
            {copy.roomsKicker}
          </p>
          <h2 className="max-w-2xl font-display text-3xl leading-tight text-soot sm:text-5xl" style={display}>
            {copy.roomsTitle}
            <em className="italic" style={{ color: "#C45C4A" }}>
              {copy.roomsAccent}
            </em>
          </h2>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {copy.rooms.map((room, i) => (
              <article
                key={room.title}
                className="overflow-hidden rounded-[1.8rem] border-[3px] border-soot bg-jasmine shadow-[5px_7px_0_0_#161210]"
              >
                <div className={i === 0 ? "bg-[#F3C4B0]" : "bg-[#C9E4D8]"}>
                  <BrandFigure id={i === 0 ? "seek" : "work"} className="mx-auto max-w-[240px] px-6 py-4" delay={i * 0.3} />
                </div>
                <div className="border-t-[3px] border-soot p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-soot/45">{room.kicker}</p>
                  <h3 className="mt-2 font-display text-2xl text-soot" style={display}>
                    {room.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-soot/60">{room.body}</p>
                  <ul className="mt-5 space-y-2 text-sm text-soot/80">
                    {room.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5">
                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-soot text-[9px] text-jasmine">
                          ✓
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={room.href}
                    className="mt-7 inline-flex rounded-full bg-soot px-5 py-2.5 text-sm font-semibold text-jasmine no-underline"
                  >
                    {room.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pomegranate">{copy.howKicker}</p>
          <h2 className="mt-3 font-display text-3xl text-soot sm:text-4xl" style={display}>
            {copy.howTitle}
          </h2>
          <div className="mt-16 space-y-20">
            {copy.howSteps.map((s, i) => {
              const fig = (["seek", "join", "work", "leap"] as const)[i]
              const reverse = i % 2 === 1
              return (
                <div
                  key={s.t}
                  className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  <div>
                    <p className="font-display text-6xl leading-none text-soot/15" style={display}>
                      0{i + 1}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-soot sm:text-3xl" style={display}>
                      {s.t}
                    </h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-soot/60">{s.d}</p>
                    <p className="mt-4 italic" style={{ color: "#C45C4A", fontFamily: "Fraunces, serif" }}>
                      {copy.howAside[i] ?? copy.howAside[0]}
                    </p>
                  </div>
                  <div>
                    {i === 1 ? (
                      <InviteMascot className="mx-auto w-full max-w-[460px]" />
                    ) : (
                      <BrandFigure id={fig} className="mx-auto max-w-[280px]" delay={i * 0.2} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="font-display text-3xl text-soot sm:text-4xl" style={display}>
            {copy.mockCaption}
          </h2>
          <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-soot/45">{copy.mockBureau}</p>
              <div className="overflow-hidden rounded-[1.6rem] border-[3px] border-soot shadow-[5px_7px_0_0_#161210]">
                <BureauMock />
              </div>
            </div>
            <div className="lg:mt-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-soot/45">{copy.mockMember}</p>
              <div className="overflow-hidden rounded-[1.6rem] border-[3px] border-soot shadow-[5px_7px_0_0_#161210]">
                <MemberMock />
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl text-soot" style={display}>
              {copy.featuresTitle}
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {copy.features.map((f, i) => (
                <div
                  key={f.t}
                  className={`rounded-[1.4rem] border-[3px] border-soot bg-jasmine p-5 shadow-[4px_5px_0_0_#161210] ${
                    i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <h3 className="font-display text-lg text-soot" style={display}>
                    {f.t}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-soot/60">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl text-soot" style={display}>
            {copy.faqTitle}
          </h2>
          <div className="mt-8 divide-y divide-soot/10 rounded-[1.8rem] border-[3px] border-soot bg-jasmine px-5 shadow-[5px_7px_0_0_#161210]">
            {copy.faq.map((item, i) => (
              <button key={item.q} type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="block w-full py-5 text-left">
                <p className="font-display text-lg text-soot" style={display}>
                  {item.q}
                </p>
                {openFaq === i && <p className="mt-2 text-sm leading-relaxed text-soot/60">{item.a}</p>}
              </button>
            ))}
          </div>
        </section>

        <section className="relative px-4 pb-16 sm:px-6">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[1.8rem] border-[3px] border-soot bg-jasmine px-6 py-16 text-center shadow-[5px_7px_0_0_#161210] sm:px-12">
            <div className="relative mx-auto mb-2 max-w-[200px]">
              <BrandFigure id="leap" delay={0.2} />
            </div>
            <h2 className="relative font-display text-3xl text-soot sm:text-4xl" style={display}>
              {copy.closeTitle}
              <em className="italic" style={{ color: "#C45C4A" }}>
                {copy.closeAccent}
              </em>
            </h2>
            <p className="relative mt-4 text-soot/60">{copy.closeSub}</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/organizations"
                className="rounded-full bg-soot px-6 py-3 text-sm font-semibold text-jasmine no-underline"
              >
                {copy.ctaPrimary}
              </Link>
              <Link
                href="/organizations/join"
                className="rounded-full border-[2px] border-soot bg-jasmine px-6 py-3 text-sm font-semibold text-soot no-underline"
              >
                {copy.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>

        <footer className="relative border-t-[3px] border-soot/10 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <span className="inline-flex items-center gap-2">
                <LogoMark className="h-8 w-8" />
                <span className="font-display text-lg text-soot" style={display}>
                  Tafsula
                </span>
              </span>
              <p className="mt-2 max-w-sm text-sm text-soot/50">{copy.footer}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/privacy" className="text-soot/50 no-underline hover:text-soot">
                {t("legal.privacy")}
              </Link>
              <Link href="/terms" className="text-soot/50 no-underline hover:text-soot">
                {t("legal.terms")}
              </Link>
              <Link href="/contact" className="text-soot/50 no-underline hover:text-soot">
                {t("legal.contact")}
              </Link>
              <Link href="/about" className="text-soot/50 no-underline hover:text-soot">
                {t("nav.about")}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PublicShell>
  )
}

