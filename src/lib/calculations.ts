import type { CostCategory, Party, StallEvent, SplitMode } from './types'
import { COST_CATEGORY_LABELS } from './constants'
import { daysBetween, isSameMonth, todayIso } from './dates'

/** Anteile Baumann / Schmid am Betrag (0–1), summieren zu 1. */
export function splitPercents(
  splitMode: SplitMode | undefined,
  baumannSharePercent: number | undefined,
  schmidSharePercent: number | undefined,
): { baumann: number; schmid: number } {
  const mode = splitMode ?? '50_50'
  if (mode === '50_50') return { baumann: 0.5, schmid: 0.5 }
  if (mode === 'baumann_only') return { baumann: 1, schmid: 0 }
  if (mode === 'schmid_only') return { baumann: 0, schmid: 1 }
  const b = (baumannSharePercent ?? 50) / 100
  const s = (schmidSharePercent ?? 50) / 100
  const sum = b + s
  if (sum <= 0) return { baumann: 0.5, schmid: 0.5 }
  return { baumann: b / sum, schmid: s / sum }
}

/** Soll-Anteil in CHF pro Familie für ein Kosten-Event. */
export function obligationSharesChf(
  amount: number,
  splitMode: SplitMode | undefined,
  baumannSharePercent: number | undefined,
  schmidSharePercent: number | undefined,
): { baumann: number; schmid: number } {
  const p = splitPercents(splitMode, baumannSharePercent, schmidSharePercent)
  return {
    baumann: amount * p.baumann,
    schmid: amount * p.schmid,
  }
}

export interface SettlementResult {
  paidBaumann: number
  paidSchmid: number
  obligationBaumann: number
  obligationSchmid: number
  totalAmount: number
  /** Positiv: Schmid schuldet Baumann (Baumann hat relativ mehr bezahlt als Soll). */
  balanceOwedToBaumannChf: number
}

/**
 * Abrechnung: Kosten-Events + Fütterung mit feedCost (50/50-Soll, bezahlt von erfassender Partei).
 */
export function computeSettlement(events: StallEvent[]): SettlementResult {
  let paidBaumann = 0
  let paidSchmid = 0
  let obligationBaumann = 0
  let obligationSchmid = 0
  let totalAmount = 0

  for (const e of events) {
    if (e.type === 'cost' && e.amountCHF != null && e.amountCHF > 0) {
      const amount = e.amountCHF
      const paidBy = e.paidBy ?? e.party
      const obl = obligationSharesChf(
        amount,
        e.splitMode,
        e.baumannSharePercent,
        e.schmidSharePercent,
      )
      totalAmount += amount
      obligationBaumann += obl.baumann
      obligationSchmid += obl.schmid
      if (paidBy === 'Baumann') paidBaumann += amount
      else paidSchmid += amount
    }
    if (e.type === 'feeding' && e.feedCost != null && e.feedCost > 0) {
      const amount = e.feedCost
      const paidBy = e.party
      const obl = obligationSharesChf(amount, '50_50', undefined, undefined)
      totalAmount += amount
      obligationBaumann += obl.baumann
      obligationSchmid += obl.schmid
      if (paidBy === 'Baumann') paidBaumann += amount
      else paidSchmid += amount
    }
  }

  const balanceOwedToBaumannChf = paidBaumann - obligationBaumann

  return {
    paidBaumann,
    paidSchmid,
    obligationBaumann,
    obligationSchmid,
    totalAmount,
    balanceOwedToBaumannChf,
  }
}

export function costsByCategoryMonth(
  events: StallEvent[],
  monthPrefix: string,
): Record<CostCategory, number> {
  const out: Record<CostCategory, number> = {
    feed: 0,
    bedding: 0,
    medicine: 0,
    repair: 0,
    equipment: 0,
    vet: 0,
    other: 0,
  }
  for (const e of events) {
    if (!isSameMonth(e.date, monthPrefix)) continue
    if (e.type === 'cost' && e.amountCHF && e.costCategory) {
      out[e.costCategory] += e.amountCHF
    }
    if (e.type === 'feeding' && e.feedCost) {
      out.feed += e.feedCost
    }
  }
  return out
}

export function totalCostsInMonth(events: StallEvent[], monthPrefix: string): number {
  let t = 0
  for (const e of events) {
    if (!isSameMonth(e.date, monthPrefix)) continue
    if (e.type === 'cost' && e.amountCHF) t += e.amountCHF
    if (e.type === 'feeding' && e.feedCost) t += e.feedCost
  }
  return t
}

export function lastCleaningDate(events: StallEvent[]): string | null {
  const dates = events
    .filter((e) => e.type === 'cleaning')
    .map((e) => e.date)
    .sort()
  return dates.length ? dates[dates.length - 1]! : null
}

export function daysSinceLastCleaning(events: StallEvent[]): number | null {
  const last = lastCleaningDate(events)
  if (!last) return null
  return daysBetween(last, todayIso())
}

export function eggsToday(events: StallEvent[]): number {
  const t = todayIso()
  return events
    .filter((e) => e.type === 'eggs' && e.date === t)
    .reduce((s, e) => s + (e.eggCount ?? 0), 0)
}

export function eggsInRange(events: StallEvent[], fromIso: string, toIso: string): number {
  return events
    .filter((e) => e.type === 'eggs' && e.date >= fromIso && e.date <= toIso)
    .reduce((s, e) => s + (e.eggCount ?? 0), 0)
}

export function eggsLast7Days(events: StallEvent[]): number {
  const t = todayIso()
  const d = new Date()
  d.setDate(d.getDate() - 6)
  const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return eggsInRange(events, from, t)
}

export function currentChickenCount(events: StallEvent[]): number {
  const stocks = events
    .filter((e) => e.type === 'stock' && e.chickenCount != null)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  if (!stocks.length) return 0
  const last = stocks[stocks.length - 1]!
  return last.chickenCount ?? 0
}

export function averageEggsPerDayLast7(events: StallEvent[]): number {
  const total = eggsLast7Days(events)
  return Math.round((total / 7) * 10) / 10
}

export function eggsPerChickenToday(events: StallEvent[]): number | null {
  const n = currentChickenCount(events)
  if (!n) return null
  const e = eggsToday(events)
  return Math.round((e / n) * 100) / 100
}

export interface WarningItem {
  id: string
  message: string
  severity: 'info' | 'warn'
}

export function buildWarnings(
  events: StallEvent[],
  settlement: SettlementResult,
): WarningItem[] {
  const w: WarningItem[] = []
  const dsc = daysSinceLastCleaning(events)
  if (dsc === null) {
    w.push({
      id: 'never-cleaned',
      message: 'Noch keine Mistung erfasst.',
      severity: 'warn',
    })
  } else if (dsc > 7) {
    w.push({
      id: 'cleaning-overdue',
      message: `Seit ${dsc} Tagen nicht gemistet (letzte Mistung).`,
      severity: 'warn',
    })
  }

  const lastFeed = events
    .filter((e) => e.type === 'feeding')
    .map((e) => e.date)
    .sort()
    .pop()
  if (lastFeed) {
    const df = daysBetween(lastFeed, todayIso())
    if (df > 14) {
      w.push({
        id: 'feed-gap',
        message: 'Länger keine Fütterung erfasst – Futtervorrat prüfen.',
        severity: 'info',
      })
    }
  }

  if (Math.abs(settlement.balanceOwedToBaumannChf) >= 50) {
    const amt = Math.abs(settlement.balanceOwedToBaumannChf).toFixed(2)
    if (settlement.balanceOwedToBaumannChf > 0) {
      w.push({
        id: 'settle-schmid',
        message: `Ausgleich prüfen: Schmid schuldet Baumann ca. ${amt} CHF (Schätzung aus Erfassung).`,
        severity: 'info',
      })
    } else {
      w.push({
        id: 'settle-baumann',
        message: `Ausgleich prüfen: Baumann schuldet Schmid ca. ${amt} CHF (Schätzung aus Erfassung).`,
        severity: 'info',
      })
    }
  }

  return w
}

export function recentActivities(events: StallEvent[], limit = 12): StallEvent[] {
  return [...events]
    .sort((a, b) => {
      const d = b.date.localeCompare(a.date)
      if (d !== 0) return d
      return b.id.localeCompare(a.id)
    })
    .slice(0, limit)
}

export function eggsByPartyMonth(
  events: StallEvent[],
  monthPrefix: string,
): Record<Party, number> {
  const out: Record<Party, number> = { Baumann: 0, Schmid: 0 }
  for (const e of events) {
    if (e.type !== 'eggs' || !e.eggCount) continue
    if (!isSameMonth(e.date, monthPrefix)) continue
    out[e.party] += e.eggCount
  }
  return out
}

export function feedKgInRange(events: StallEvent[], fromIso: string, toIso: string): number {
  return events
    .filter((e) => e.type === 'feeding' && e.date >= fromIso && e.date <= toIso)
    .reduce((s, e) => s + (e.feedAmountKg ?? 0), 0)
}

export function categoryLabel(cat: CostCategory): string {
  return COST_CATEGORY_LABELS[cat]
}

/** Eier pro Tag Serie (letzte N Tage) */
export function eggsPerDaySeries(events: StallEvent[], days: number): { date: string; eggs: number }[] {
  const out: { date: string; eggs: number }[] = []
  const d = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(x.getDate() - i)
    const iso = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
    const eggs = events
      .filter((e) => e.type === 'eggs' && e.date === iso)
      .reduce((s, e) => s + (e.eggCount ?? 0), 0)
    out.push({ date: iso, eggs })
  }
  return out
}

export function totalEggsAllTime(events: StallEvent[]): number {
  return events.filter((e) => e.type === 'eggs').reduce((s, e) => s + (e.eggCount ?? 0), 0)
}

export function averageCostPerEggChf(events: StallEvent[]): number | null {
  const eggs = totalEggsAllTime(events)
  if (!eggs) return null
  const costEvents = events.filter((e) => e.type === 'cost' && e.amountCHF)
  const feedingCosts = events.filter((e) => e.type === 'feeding' && e.feedCost)
  const totalChf =
    costEvents.reduce((s, e) => s + (e.amountCHF ?? 0), 0) +
    feedingCosts.reduce((s, e) => s + (e.feedCost ?? 0), 0)
  if (!totalChf) return null
  return Math.round((totalChf / eggs) * 100) / 100
}

export function averageCostPerChickenMonthChf(
  events: StallEvent[],
  monthPrefix: string,
): number | null {
  const chickens = currentChickenCount(events)
  if (!chickens) return null
  const m = totalCostsInMonth(events, monthPrefix)
  if (!m) return null
  return Math.round((m / chickens) * 100) / 100
}
