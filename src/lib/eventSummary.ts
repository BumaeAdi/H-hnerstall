import { COST_CATEGORY_LABELS } from './constants'
import type { StallEvent } from './types'

/** Kurzbeschreibung für Listen und Kalender. */
export function summarizeEvent(e: StallEvent): string {
  switch (e.type) {
    case 'eggs':
      return `${e.eggCount ?? 0} Eier`
    case 'cleaning':
      return 'Mistung'
    case 'feeding':
      return `${e.feedAmountKg ?? 0} kg` + (e.feedCost != null ? ` · ${e.feedCost} CHF` : '')
    case 'cost':
      return `${e.amountCHF?.toFixed(2) ?? '?'} CHF · ${e.costCategory ? COST_CATEGORY_LABELS[e.costCategory] : ''}`
    case 'note':
      return e.note?.slice(0, 80) ?? ''
    case 'stock':
      return `${e.chickenCount ?? '?'} Hühner`
    default:
      return ''
  }
}
