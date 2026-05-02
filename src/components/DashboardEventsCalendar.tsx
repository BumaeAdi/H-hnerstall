import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { EventType, StallEvent } from '../lib/types'
import { EVENT_TYPE_LABELS } from '../lib/constants'
import { formatDeDate, todayIso } from '../lib/dates'
import { summarizeEvent } from '../lib/eventSummary'

function parseYearMonth(ym: string): { y: number; m: number } {
  const [ys, ms] = ym.split('-')
  return { y: Number(ys), m: Number(ms) }
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate()
}

/** Montag = 0 … Sonntag = 6 */
function mondayIndexFromSunday(jsDay: number): number {
  return (jsDay + 6) % 7
}

function shiftMonth(ym: string, delta: number): string {
  const { y, m } = parseYearMonth(ym)
  const d = new Date(y, m - 1 + delta, 1)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yy}-${mm}`
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const

const typeDotClass: Record<EventType, string> = {
  eggs: 'bg-baumann-500',
  cleaning: 'bg-schmid-500',
  feeding: 'bg-amber-500',
  cost: 'bg-violet-500',
  note: 'bg-fuchsia-500',
  stock: 'bg-stone-400 dark:bg-stone-500',
}

export function DashboardEventsCalendar({ events }: { events: StallEvent[] }) {
  const [month, setMonth] = useState(() => todayIso().slice(0, 7))
  const [selectedIso, setSelectedIso] = useState<string | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, StallEvent[]>()
    for (const e of events) {
      const d = e.date.slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue
      const list = map.get(d) ?? []
      list.push(e)
      map.set(d, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.id.localeCompare(b.id))
    }
    return map
  }, [events])

  const { y, m } = parseYearMonth(month)
  const dim = daysInMonth(y, m)
  const firstDow = mondayIndexFromSunday(new Date(y, m - 1, 1).getDay())
  const totalCells = Math.ceil((firstDow + dim) / 7) * 7
  const today = todayIso()

  const monthTitle = useMemo(
    () =>
      new Intl.DateTimeFormat('de-CH', { month: 'long', year: 'numeric' }).format(
        new Date(y, m - 1, 1),
      ),
    [y, m],
  )

  const cells: ({ kind: 'empty' } | { kind: 'day'; iso: string; day: number })[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDow + 1
    if (i < firstDow || dayNum > dim) {
      cells.push({ kind: 'empty' })
    } else {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      cells.push({ kind: 'day', iso, day: dayNum })
    }
  }

  const selectedEvents =
    selectedIso && byDate.has(selectedIso) ? (byDate.get(selectedIso) ?? []) : []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="rounded-lg border border-stone-200 p-2 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
          onClick={() => {
            setMonth((prev) => shiftMonth(prev, -1))
            setSelectedIso(null)
          }}
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-center text-base font-semibold text-stone-900 dark:text-stone-100">
          {monthTitle}
        </h2>
        <button
          type="button"
          className="rounded-lg border border-stone-200 p-2 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
          onClick={() => {
            setMonth((prev) => shiftMonth(prev, 1))
            setSelectedIso(null)
          }}
          aria-label="Nächster Monat"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-stone-500 sm:text-xs">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (cell.kind === 'empty') {
            return <div key={`e-${idx}`} className="min-h-[4.25rem] rounded-lg bg-stone-50/50 dark:bg-stone-900/30" />
          }
          const list = byDate.get(cell.iso) ?? []
          const isToday = cell.iso === today
          const isSelected = cell.iso === selectedIso
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelectedIso((s) => (s === cell.iso ? null : cell.iso))}
              className={`flex min-h-[4.25rem] flex-col rounded-lg border p-1 text-left transition sm:min-h-[5rem] ${
                isSelected
                  ? 'border-baumann-500 bg-baumann-50 ring-1 ring-baumann-500 dark:bg-baumann-950/50'
                  : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600'
              } ${isToday && !isSelected ? 'ring-1 ring-amber-400 dark:ring-amber-600' : ''}`}
            >
              <span
                className={`text-xs font-semibold tabular-nums sm:text-sm ${
                  isToday ? 'text-amber-700 dark:text-amber-300' : 'text-stone-800 dark:text-stone-100'
                }`}
              >
                {cell.day}
              </span>
              <div className="mt-auto flex flex-wrap gap-0.5">
                {list.slice(0, 6).map((e) => (
                  <span
                    key={e.id}
                    className={`size-1.5 shrink-0 rounded-full sm:size-2 ${typeDotClass[e.type]}`}
                    title={`${EVENT_TYPE_LABELS[e.type]}: ${summarizeEvent(e)}`}
                  />
                ))}
                {list.length > 6 && (
                  <span className="text-[9px] font-medium text-stone-500">+{list.length - 6}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {selectedIso && (
        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 dark:border-stone-700 dark:bg-stone-800/50">
          <p className="mb-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
            {formatDeDate(selectedIso)}
            <span className="ml-2 font-normal text-stone-500">
              ({selectedEvents.length} {selectedEvents.length === 1 ? 'Eintrag' : 'Einträge'})
            </span>
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-stone-500">Keine Einträge.</p>
          ) : (
            <ul className="max-h-60 space-y-2 overflow-y-auto text-sm">
              {selectedEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-col gap-0.5 rounded-lg border border-stone-100 bg-white px-2 py-2 dark:border-stone-700 dark:bg-stone-900"
                >
                  <span className="font-medium text-stone-800 dark:text-stone-100">
                    {EVENT_TYPE_LABELS[e.type]}
                    <span
                      className={
                        e.party === 'Baumann'
                          ? ' ml-2 rounded-full bg-baumann-100 px-1.5 py-0.5 text-xs text-baumann-800 dark:bg-baumann-900/50 dark:text-baumann-200'
                          : ' ml-2 rounded-full bg-schmid-100 px-1.5 py-0.5 text-xs text-schmid-800 dark:bg-schmid-900/50 dark:text-schmid-200'
                      }
                    >
                      {e.party}
                    </span>
                  </span>
                  <span className="text-stone-600 dark:text-stone-300">{summarizeEvent(e)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-xs text-stone-500 dark:text-stone-400">
        Farbpunkte: Eier · Mistung · Fütterung · Kosten · Notiz · Bestand. Tag antippen für
        Details.
      </p>
    </div>
  )
}
