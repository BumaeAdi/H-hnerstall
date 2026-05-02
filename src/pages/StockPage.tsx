import { useState } from 'react'
import { Bird } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatDeDate, todayIso } from '../lib/dates'
import { newId } from '../lib/id'
import type { StallEvent } from '../lib/types'

export function StockPage() {
  const { auth, events, addEvent } = useAppState()
  const [date, setDate] = useState(todayIso())
  const [count, setCount] = useState('8')
  const [msg, setMsg] = useState('')

  if (!auth) return null

  const history = [...events]
    .filter((e) => e.type === 'stock')
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) return
    const n = Number(count)
    if (!Number.isFinite(n) || n < 0 || n > 500) {
      setMsg('Bitte gültige Anzahl eingeben.')
      return
    }
    const ev: StallEvent = {
      id: newId(),
      type: 'stock',
      date,
      party: auth.party,
      chickenCount: Math.round(n),
    }
    addEvent(ev)
    setMsg('Bestand gespeichert.')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-100">
          <Bird className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Hühnerbestand</h1>
          <p className="text-sm text-stone-500">Änderungen werden historisiert.</p>
        </div>
      </div>

      <Card title="Neuer Bestand">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="st-date">
              Datum
            </label>
            <input
              id="st-date"
              type="date"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="st-n">
              Anzahl Hühner
            </label>
            <input
              id="st-n"
              inputMode="numeric"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
            />
          </div>
          {msg && <p className="text-sm text-green-700 dark:text-green-400">{msg}</p>}
          <Button type="submit" className="w-full">
            Speichern
          </Button>
        </form>
      </Card>

      <Card title="Historie">
        {history.length === 0 ? (
          <p className="text-sm text-stone-500">Noch keine Bestandsänderungen.</p>
        ) : (
          <ul className="divide-y divide-stone-100 text-sm dark:divide-stone-800">
            {history.map((e) => (
              <li key={e.id} className="flex justify-between py-2">
                <span>{formatDeDate(e.date)}</span>
                <span className="font-medium">{e.chickenCount} Hühner</span>
                <span className="text-stone-500">{e.party}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
