import { useState } from 'react'
import { Sparkles, AlertTriangle } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { daysSinceLastCleaning } from '../lib/calculations'
import { todayIso } from '../lib/dates'
import { newId } from '../lib/id'
import type { StallEvent } from '../lib/types'

export function CleaningPage() {
  const { auth, events, addEvent } = useAppState()
  const [date, setDate] = useState(todayIso())
  const [msg, setMsg] = useState('')

  if (!auth) return null

  const daysSince = daysSinceLastCleaning(events)
  const warn =
    daysSince !== null && daysSince > 7
      ? `Letzte Mistung ist länger als 7 Tage her (${daysSince} Tage).`
      : daysSince !== null && daysSince > 0
        ? `Letzte Mistung vor ${daysSince} Tag(en).`
        : null

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) return
    const ev: StallEvent = {
      id: newId(),
      type: 'cleaning',
      date,
      party: auth.party,
    }
    addEvent(ev)
    setMsg('Mistung gespeichert.')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-schmid-100 text-schmid-700 dark:bg-schmid-900/40 dark:text-schmid-200">
          <Sparkles className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Mistung</h1>
          <p className="text-sm text-stone-500">Partei: {auth.party}</p>
        </div>
      </div>

      {warn && daysSince !== null && daysSince > 7 && (
        <div className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100">
          <AlertTriangle className="size-5 shrink-0" aria-hidden />
          <span>{warn}</span>
        </div>
      )}

      {warn && daysSince !== null && daysSince <= 7 && (
        <p className="text-sm text-stone-600 dark:text-stone-400">{warn}</p>
      )}

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="clean-date">
              Datum
            </label>
            <input
              id="clean-date"
              type="date"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          {msg && <p className="text-sm text-green-700 dark:text-green-400">{msg}</p>}
          <Button type="submit" variant="schmid" className="w-full">
            Mistung speichern
          </Button>
        </form>
      </Card>
    </div>
  )
}
