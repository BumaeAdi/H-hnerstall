import { useState } from 'react'
import { Wheat } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { todayIso } from '../lib/dates'
import { newId } from '../lib/id'
import type { StallEvent } from '../lib/types'

export function FeedingPage() {
  const { auth, addEvent } = useAppState()
  const [date, setDate] = useState(todayIso())
  const [kg, setKg] = useState('')
  const [cost, setCost] = useState('')
  const [supplier, setSupplier] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')

  if (!auth) return null

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) return
    if (!kg.trim()) {
      setMsg('Bitte Futtermenge in kg eingeben.')
      return
    }
    const k = Number(kg.replace(',', '.'))
    if (!Number.isFinite(k) || k <= 0 || k > 500) {
      setMsg('Bitte eine gültige Menge zwischen 0 und 500 kg eingeben.')
      return
    }
    let feedCost: number | undefined
    if (cost.trim()) {
      const c = Number(cost.replace(',', '.'))
      if (!Number.isFinite(c) || c < 0) {
        setMsg('Kosten in CHF ungültig.')
        return
      }
      feedCost = Math.round(c * 100) / 100
    }
    const ev: StallEvent = {
      id: newId(),
      type: 'feeding',
      date,
      party: auth.party,
      feedAmountKg: Math.round(k * 100) / 100,
      feedCost,
      supplier: supplier.trim() || undefined,
      note: note.trim() || undefined,
    }
    addEvent(ev)
    setMsg('Fütterung gespeichert.')
    setCost('')
    setNote('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          <Wheat className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Fütterung</h1>
          <p className="text-sm text-stone-500">Partei: {auth.party}</p>
        </div>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="fd-date">
              Datum
            </label>
            <input
              id="fd-date"
              type="date"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="fd-kg">
              Futtermenge (kg)
            </label>
            <input
              id="fd-kg"
              inputMode="decimal"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="fd-cost">
              Kosten (CHF, optional)
            </label>
            <input
              id="fd-cost"
              inputMode="decimal"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="fd-sup">
              Lieferant / Marke (optional)
            </label>
            <input
              id="fd-sup"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="fd-note">
              Bemerkung (optional)
            </label>
            <input
              id="fd-note"
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
