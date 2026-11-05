import { ArabicShaper } from "arabic-persian-reshaper"
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"

type SwotBlock = { strengths?: string; weaknesses?: string; opportunities?: string; threats?: string }
type SmartBlock = {
  specific?: string
  measurable?: string
  achievable?: string
  relevant?: string
  timeBound?: string
}

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

function pickSwot(proposal: { canvasJson?: any; swotJson?: any } | null): SwotBlock {
  const c = proposal?.canvasJson?.swot
  if (c && typeof c === "object") return c as SwotBlock
  const s = proposal?.swotJson
  if (s && typeof s === "object") return s as SwotBlock
  return {}
}

function pickSmart(proposal: { canvasJson?: any } | null): SmartBlock {
  const m = proposal?.canvasJson?.smart
  if (m && typeof m === "object") return m as SmartBlock
  return {}
}

function visibilityLabel(v: string | undefined) {
  if (v === "PRIVATE") return "Private"
  if (v === "HR_ONLY") return "HR only"
  if (v === "ORG") return "Organization"
  return v || "—"
}

function safeName(s: string | undefined) {
  return (s || "proposal")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48)
}

const A4_W = 595.28
const A4_H = 841.89

const COL = {
  ink: rgb(0.12, 0.14, 0.2),
  muted: rgb(0.4, 0.42, 0.48),
  rule: rgb(0.82, 0.84, 0.88),
  band: rgb(0.14, 0.26, 0.5),
  bandText: rgb(0.98, 0.99, 1),
  swotS: rgb(0.06, 0.46, 0.34),
  swotW: rgb(0.58, 0.36, 0.08),
  swotO: rgb(0.1, 0.4, 0.66),
  swotT: rgb(0.58, 0.14, 0.2),
  smart: rgb(0.38, 0.2, 0.58),
}

function reshapeArabic(text: string): string {
  if (!ARABIC_RE.test(text)) return text
  try {
    return ArabicShaper.convertArabic(text)
  } catch {
    return text
  }
}

function scriptForParagraph(text: string): "arab" | "latn" {
  const t = text.trim()
  if (!t) return "latn"
  let ar = 0
  let la = 0
  for (const ch of t) {
    const c = ch.codePointAt(0)!
    if (c >= 0x0600 && c <= 0x06ff) ar++
    else if (/\S/.test(ch)) la++
  }
  return ar >= la && ar > 0 ? "arab" : "latn"
}

async function loadUnicodeFonts(doc: PDFDocument): Promise<{ latin: PDFFont; arabic: PDFFont }> {
  const latinUrls = [
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.1.0/files/noto-sans-latin-ext-400-normal.ttf",
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.1.0/files/noto-sans-latin-400-normal.ttf",
  ]
  const arabicUrl =
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@5.1.0/files/noto-sans-arabic-arabic-400-normal.ttf"

  let latinBuf: ArrayBuffer | null = null
  for (const u of latinUrls) {
    try {
      const r = await fetch(u, { mode: "cors" })
      if (r.ok) {
        latinBuf = await r.arrayBuffer()
        break
      }
    } catch {
      /* next */
    }
  }
  let arabBuf: ArrayBuffer | null = null
  try {
    const r = await fetch(arabicUrl, { mode: "cors" })
    if (r.ok) arabBuf = await r.arrayBuffer()
  } catch {
    /* ignore */
  }

  const helv = await doc.embedFont(StandardFonts.Helvetica)
  const latin = latinBuf ? await doc.embedFont(latinBuf).catch(() => helv) : helv
  const arabic = arabBuf ? await doc.embedFont(arabBuf).catch(() => latin) : latin
  return { latin, arabic }
}

function wrapLines(
  text: string,
  size: number,
  maxWidth: number,
  latin: PDFFont,
  arabic: PDFFont
): { text: string; font: PDFFont; script: "arab" | "latn" }[] {
  const script = scriptForParagraph(text)
  const prepared = script === "arab" ? reshapeArabic(text.trim() || "—") : (text.trim() || "—")
  const measure = script === "arab" ? arabic : latin
  const out: { text: string; font: PDFFont; script: "arab" | "latn" }[] = []
  for (const paragraph of prepared.split(/\n/)) {
    const pScript = scriptForParagraph(paragraph)
    const pPrep = pScript === "arab" ? reshapeArabic(paragraph.trim() || "—") : paragraph.trim() || "—"
    const m = pScript === "arab" ? arabic : latin
    const words = pPrep.split(/\s+/).filter(Boolean)
    let line = ""
    for (const w of words) {
      const next = line ? `${line} ${w}` : w
      if (m.widthOfTextAtSize(next, size) <= maxWidth) line = next
      else {
        if (line) out.push({ text: line, font: m, script: pScript })
        line = w
      }
    }
    if (line) out.push({ text: line, font: m, script: pScript })
    if (words.length === 0) out.push({ text: "—", font: m, script: pScript })
  }
  return out.length ? out : [{ text: "—", font: measure, script }]
}

export async function downloadProposalPdf(proposal: {
  id: string
  title: string
  type?: string
  status?: string
  visibility?: string
  expectedImpact?: string | null
  canvasJson?: any
  swotJson?: any
  timelineStart?: string | Date | null
  timelineEnd?: string | Date | null
  createdAt?: string | Date
  updatedAt?: string | Date
  submittedBy?: { name?: string | null } | null
  reviewer?: { name?: string | null } | null
  comments?: { body: string; createdAt?: string | Date; author?: { name?: string | null } | null }[]
}) {
  const doc = await PDFDocument.create()
  const { latin, arabic } = await loadUnicodeFonts(doc)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  let page: PDFPage = doc.addPage([A4_W, A4_H])
  let y = A4_H - 52
  const margin = 48
  const maxW = A4_W - 2 * margin
  const bodySize = 10.5
  const lineH = 12.2
  const bottom = 52

  const newPage = () => {
    page = doc.addPage([A4_W, A4_H])
    y = A4_H - 52
  }

  const ensure = (h: number) => {
    if (y - h < bottom) newPage()
  }

  const drawRule = () => {
    ensure(8)
    page.drawLine({
      start: { x: margin, y: y - 4 },
      end: { x: margin + maxW, y: y - 4 },
      thickness: 0.55,
      color: COL.rule,
    })
    y -= 16
  }

  const drawMajorTitle = (label: string) => {
    ensure(26)
    const h = 22
    page.drawRectangle({
      x: margin,
      y: y - h + 4,
      width: maxW,
      height: h,
      color: COL.band,
      borderColor: rgb(0.08, 0.14, 0.28),
      borderWidth: 0.45,
    })
    page.drawText(label.toUpperCase(), {
      x: margin + 10,
      y: y - h + 8,
      size: 11,
      font: bold,
      color: COL.bandText,
    })
    y -= h + 12
  }

  const drawSubTitle = (label: string, accent: ReturnType<typeof rgb>) => {
    ensure(18)
    const h = 14
    page.drawRectangle({
      x: margin,
      y: y - h + 3,
      width: 3.5,
      height: h,
      color: accent,
    })
    page.drawText(label, {
      x: margin + 10,
      y: y - h + 4,
      size: 10.5,
      font: bold,
      color: accent,
    })
    y -= h + 8
  }

  const drawParagraph = (text: string) => {
    const lines = wrapLines(text, bodySize, maxW, latin, arabic)
    for (const row of lines) {
      ensure(lineH)
      const shaped = row.script === "arab" ? reshapeArabic(row.text) : row.text
      const w = row.font.widthOfTextAtSize(shaped, bodySize)
      const x = row.script === "arab" ? margin + maxW - w : margin
      page.drawText(shaped, {
        x,
        y,
        size: bodySize,
        font: row.font,
        color: COL.ink,
      })
      y -= lineH
    }
    y -= 8
  }

  page.drawText("Proposal submission", {
    x: margin,
    y,
    size: 19,
    font: bold,
    color: rgb(0.06, 0.08, 0.14),
  })
  y -= 24
  drawParagraph(proposal.title)
  drawRule()

  drawMajorTitle("Record & metadata")
  drawParagraph(
    [
      `Proposal ID: ${proposal.id}`,
      `Title: ${proposal.title}`,
      `Type: ${proposal.type || "—"}`,
      `Status: ${proposal.status || "—"}`,
      `Visibility: ${visibilityLabel(proposal.visibility)}`,
      `Submitted by: ${proposal.submittedBy?.name || "—"}`,
      proposal.reviewer?.name ? `Reviewer: ${proposal.reviewer.name}` : "",
      proposal.createdAt ? `Created: ${new Date(proposal.createdAt).toLocaleString()}` : "",
      proposal.updatedAt ? `Updated: ${new Date(proposal.updatedAt).toLocaleString()}` : "",
      proposal.timelineStart ? `Timeline start: ${new Date(proposal.timelineStart).toLocaleString()}` : "",
      proposal.timelineEnd ? `Timeline end: ${new Date(proposal.timelineEnd).toLocaleString()}` : "",
      "",
      "Note: text may be in English, French, or Arabic. Arabic lines are reshaped and right-aligned when detected.",
    ]
      .filter(Boolean)
      .join("\n")
  )
  drawRule()

  const writeUp =
    (proposal.expectedImpact && String(proposal.expectedImpact).trim()) ||
    (proposal.canvasJson?.description && String(proposal.canvasJson.description).trim()) ||
    ""

  drawMajorTitle("Member write-up")
  drawParagraph(writeUp || "—")
  drawRule()

  const swot = pickSwot(proposal)
  const swotItems: [keyof SwotBlock, string, ReturnType<typeof rgb>][] = [
    ["strengths", "Strengths", COL.swotS],
    ["weaknesses", "Weaknesses", COL.swotW],
    ["opportunities", "Opportunities", COL.swotO],
    ["threats", "Threats", COL.swotT],
  ]
  drawMajorTitle("SWOT analysis")
  for (const [key, label, col] of swotItems) {
    drawSubTitle(label, col)
    drawParagraph(String(swot[key] || ""))
  }
  drawRule()

  const smart = pickSmart(proposal)
  const smartItems: [keyof SmartBlock, string][] = [
    ["specific", "Specific"],
    ["measurable", "Measurable"],
    ["achievable", "Achievable"],
    ["relevant", "Relevant"],
    ["timeBound", "Time-bound"],
  ]
  drawMajorTitle("SMART goals")
  for (const [key, label] of smartItems) {
    drawSubTitle(label, COL.smart)
    drawParagraph(String(smart[key] || ""))
  }
  drawRule()

  const rawCanvas = proposal.canvasJson
  if (rawCanvas && typeof rawCanvas === "object") {
    drawMajorTitle("Canvas data (raw JSON)")
    try {
      drawParagraph(JSON.stringify(rawCanvas, null, 2))
    } catch {
      drawParagraph(String(rawCanvas))
    }
    drawRule()
  }

  const comments = proposal.comments || []
  if (comments.length) {
    drawMajorTitle("HR comments & discussion")
    for (const c of comments) {
      const who = c.author?.name || "Reviewer"
      const when = c.createdAt ? new Date(c.createdAt).toLocaleString() : ""
      drawSubTitle(`${who}${when ? ` · ${when}` : ""}`, COL.muted)
      drawParagraph(c.body || "—")
    }
    drawRule()
  }

  const footer = `Proposal ${proposal.id} · Generated ${new Date().toLocaleString()}`
  const pages = doc.getPages()
  for (const p of pages) {
    p.drawText(footer, {
      x: margin,
      y: 28,
      size: 8,
      font: bold,
      color: COL.muted,
    })
  }

  const bytes = await doc.save()
  const blob = new Blob([bytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${safeName(proposal.title)}-${proposal.id.slice(0, 8)}.pdf`
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
