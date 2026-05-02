import { useState } from 'react'
import { Egg } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { todayIso } from '../lib/dates'
import { newId } from '../lib/id'
import type { StallEvent } from '../lib/types'

export function EggsPage() {
  const { auth, addEvent } = useAppState()
  const [date, setDate] = useState(todayIso())
  const [count, setCount] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')

  if (!auth) return null

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) return
    if (!count.trim()) {
      setMsg('Bitte Anzahl eingeben.')
      return
    }
    const n = Number(count.replace(',', '.'))
    if (!Number.isFinite(n) || n < 0 || n > 500 || !Number.isInteger(n)) {
      setMsg('Bitte eine ganze Zahl zwischen 0 und 500 eingeben.')
      return
    }
    const ev: StallEvent = {
      id: newId(),
      type: 'eggs',
      date,
      party: auth.party,
      eggCount: Math.round(n),
      note: note.trim() || undefined,
    }
    addEvent(ev)
    setMsg('Gespeichert.')
    setCount('')
    setNote('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-baumann-100 text-baumann-700 dark:bg-baumann-900 dark:text-baumann-50">
          <Egg className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Eier erfassen</h1>
          <p className="text-sm text-stone-500">Partei: {auth.party}</p>
        </div>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="egg-date">
              Datum
            </label>
            <input
              id="egg-date"
              type="date"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="egg-count">
              Anzahl Eier
            </label>
            <input
              id="egg-count"
              inputMode="numeric"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="egg-note">
              Notiz (optional)
            </label>
            <input
              id="egg-note"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {msg && <p className="text-sm text-green-700 dark:text-green-400">{msg}</p>}
          <Button type="submit" className="w-full">
            Speichern
          </Button>
        </form>
      </Card>
    </div>
  )
}
