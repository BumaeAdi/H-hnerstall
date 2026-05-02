import type { StallEvent } from './types'
import { EVENT_TYPE_LABELS } from './constants'
import { formatDeDate } from './dates'

function esc(s: string): string {
  if (s.includes('"') || s.includes(';') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function eventsToCsv(events: StallEvent[]): string {
  const headers = [
    'id',
    'typ',
    'datum',
    'partei',
    'eier',
    'futter_kg',
    'futter_chf',
    'kategorie',
    'betrag_chf',
    'bezahlt_von',
    'aufteilung',
    'beschreibung',
    'notiz',
    'huehner',
  ]
  const rows = [...events]
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
    .map((e) => {
      const split =
        e.splitMode === 'custom'
          ? `${e.baumannSharePercent ?? ''}/${e.schmidSharePercent ?? ''}`
          : (e.splitMode ?? '')
      return [
        e.id,
        EVENT_TYPE_LABELS[e.type],
        formatDeDate(e.date),
        e.party,
        e.eggCount != null ? String(e.eggCount) : '',
        e.feedAmountKg != null ? String(e.feedAmountKg) : '',
        e.feedCost != null ? String(e.feedCost) : '',
        e.costCategory ?? '',
        e.amountCHF != null ? String(e.amountCHF) : '',
        e.paidBy ?? '',
        split,
        e.description ?? '',
        e.note ?? e.receiptNote ?? '',
        e.chickenCount != null ? String(e.chickenCount) : '',
      ]
        .map((c) => esc(String(c)))
        .join(';')
    })
  return [headers.join(';'), ...rows].join('\n')
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
