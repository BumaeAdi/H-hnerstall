/** Heutiges Datum im Format YYYY-MM-DD (lokale Zeitzone). */
export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysBetween(aIso: string, bIso: string): number {
  const a = parseIsoDate(aIso).getTime()
  const b = parseIsoDate(bIso).getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function startOfMonthIso(iso: string): string {
  return `${iso.slice(0, 7)}-01`
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

export function formatDeDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
