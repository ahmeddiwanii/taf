"use client"

import { useEffect, useState } from "react"
import { LogoMark } from "@/components/brand/logo"
import { useLocale } from "@/lib/i18n/locale-context"

const STEPS = {
  en: [
    { title: "Your club", body: "This is your association’s home. The bureau invites members and runs events." },
    { title: "Events", body: "Workshops, hangouts, trainings. Register in one tap, then show up." },
    { title: "Teams", body: "Each event can have teams (welcome desk, logistics, comms). Join one and help." },
    { title: "Tasks & points", body: "Finish tasks your team lead assigns. The bureau approves them and you earn points." },
    { title: "Ideas & news", body: "Share ideas with the bureau and follow club news in the feed." },
  ],
  fr: [
    { title: "Ton club", body: "C’est le QG de ton association. Le bureau invite les membres et organise les événements." },
    { title: "Événements", body: "Ateliers, sorties, formations. Inscris-toi en un clic, puis viens." },
    { title: "Équipes", body: "Chaque événement peut avoir des équipes (accueil, logistique, comm). Rejoins-en une." },
    { title: "Tâches & points", body: "Termine les tâches de ton chef d’équipe. Le bureau valide et tu gagnes des points." },
    { title: "Idées & actu", body: "Propose des idées au bureau et suis l’actu du club." },
  ],
  ar: [
    { title: "ناديك", body: "هذا مقرّ جمعيتك. المكتب يدعو الأعضاء وينظّم الفعاليات." },
    { title: "الفعاليات", body: "ورش، لقاءات، تدريبات. سجّل بنقرة واحدة ثم احضر." },
    { title: "الفرق", body: "لكل فعالية فرق (استقبال، لوجستيك، تواصل). انضم لفريق وساعد." },
    { title: "المهام والنقاط", body: "أنجز مهام قائد فريقك. المكتب يوافق وتحصل على نقاط." },
    { title: "الأفكار والأخبار", body: "اقترح أفكارًا على المكتب وتابع أخبار النادي." },
  ],
} as const

const STORAGE_KEY = "tafsula_tour_v1"

export function OnboardingTour({ role = "member" }: { role?: "member" | "hr" }) {
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const steps = STEPS[locale] ?? STEPS.fr

  useEffect(() => {
    try {
      if (!localStorage.getItem(`${STORAGE_KEY}:${role}`)) setOpen(true)
    } catch {
      /* ignore */
    }
  }, [role])

  if (!open) return null

  const finish = () => {
    try {
      localStorage.setItem(`${STORAGE_KEY}:${role}`, "1")
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  const current = steps[step]

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1c2e] p-6 text-white shadow-2xl">
        <div className="mb-4 flex justify-center">
          <LogoMark className="h-12 w-12" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2a9d8f]">
          {step + 1} / {steps.length}
        </p>
        <h2 className="mt-2 text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {current.title}
        </h2>
        <p className="mt-2 text-sm text-white/60">{current.body}</p>
        <div className="mt-6 flex gap-2">
          {step < steps.length - 1 ? (
            <>
              <button
                type="button"
                onClick={finish}
                className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="ml-auto rounded-xl bg-[#e85d4c] px-4 py-2 text-sm font-semibold"
              >
                Next
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="ml-auto rounded-xl bg-[#e85d4c] px-4 py-2 text-sm font-semibold"
            >
              Let&apos;s go
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
