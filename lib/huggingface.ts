/**
 * AI insights were tied to the removed DISC assessment.
 * Kept as a no-op stub so old imports do not break builds.
 */
export async function generateInsight(_input?: unknown): Promise<string> {
  return "Personality insights are no longer part of Tafsula."
}

export function generateFallbackInsight(_input?: unknown): string {
  return "Personality insights are no longer part of Tafsula."
}
