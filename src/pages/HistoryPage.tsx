import { useMemo, useState } from 'react'
import { History, Trash2, Download } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EVENT_TYPE_LABELS, SPLIT_MODE_LABELS } from '../lib/constants'
import { downloadCsv, eventsToCsv } from '../lib/csv'
import { formatDeDate, todayIso } from '../lib/dates'
import { summarizeEvent } from '../lib/eventSummary'
import type { EventType, Party } from '../lib/types'

export function HistoryPage() {
  const { events, removeEvent, clearAllData } = useAppState()
  const [type, setType] = useState<EventType | 'all'>('all')
  const [party, setParty] = useState<Party | 'all'>('all')
  const [month, setMonth] = useState(() => todayIso().slice(0, 7))

  const filtered = useMemo(() => {
    return [...events]
      .filter((e) => {
        if (type !== 'all' && e.type !== type) return false
        if (party !== 'all' && e.party !== party) return false
        if (month && e.date.slice(0, 7) !== month) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [events, type, party, month])

  function exportCsv() {
    const csv = eventsToCsv(filtered)
    downloadCsv(`huehnerstall-historie-${month || 'alle'}.csv`, csv)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-100">
          <History className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Historie</h1>
          <p className="text-sm text-stone-500">Alle Einträge chronologisch</p>
        </div>
      </div>

      <Card title="Filter">
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-stone-300 px-2 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
            value={type}
            onChange={(e) => setType(e.target.value as EventType | 'all')}
          >
            <option value="all">Alle Typen</option>
            {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-stone-300 px-2 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
            value={party}
            onChange={(e) => setParty(e.target.value as Party | 'all')}
          >
            <option value="all">Alle Parteien</option>
            <option value="Baumann">Baumann</option>
            <option value="Schmid">Schmid</option>
          </select>
          <input
            type="month"
            className="rounded-lg border border-stone-300 px-2 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <Button variant="secondary" className="gap-1" onClick={exportCsv}>
            <Download className="size-4" aria-hidden />
            CSV Export
          </Button>
        </div>
      </Card>

      <Card title={`Einträge (${filtered.length})`}>
        <ul className="space-y-2">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="flex flex-col gap-1 rounded-xl border border-stone-100 px-3 py-2 text-sm dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{EVENT_TYPE_LABELS[e.type]}</span>
                  <span className="text-stone-500">{formatDeDate(e.date)}</span>
                  <span
                    className={
                      e.party === 'Baumann'
                        ? 'rounded-full bg-baumann-100 px-2 py-0.5 text-xs text-baumann-800 dark:bg-baumann-900/40 dark:text-baumann-200'
                        : 'rounded-full bg-schmid-100 px-2 py-0.5 text-xs text-schmid-800 dark:bg-schmid-900/40 dark:text-schmid-200'
                    }
                  >
                    {e.party}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-stone-600 dark:text-stone-300">
                  {summarizeEvent(e)}
                </p>
                {e.type === 'cost' && e.splitMode && (
                  <p className="text-xs text-stone-500">
                    Aufteilung: {SPLIT_MODE_LABELS[e.splitMode]}
                    {e.splitMode === 'custom' &&
                      ` (${e.baumannSharePercent ?? '?'}/${e.schmidSharePercent ?? '?'} %)`}
                  </p>
                )}
              </div>
              <button
                type="button"
                title="Eintrag löschen"
                className="self-end rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 sm:self-center"
                onClick={() => {
                  if (confirm('Eintrag wirklich löschen?')) removeEvent(e.id)
                }}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-stone-500">Keine Einträge für die gewählten Filter.</li>
          )}
        </ul>
      </Card>

      <Card title="Datenpflege (lokal)">
        <p className="mb-3 text-sm text-stone-600 dark:text-stone-400">
          Alle Einträge im Browser löschen. Achtung: Das ist endgültig auf diesem Gerät.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm('Alle Daten im Browser wirklich löschen?')) clearAllData()
          }}
        >
          Alles leeren
        </Button>
      </Card>
    </div>
  )
}
