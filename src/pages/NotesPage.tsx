import { useState } from 'react'
import { StickyNote } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { todayIso } from '../lib/dates'
import { newId } from '../lib/id'
import type { StallEvent } from '../lib/types'

export function NotesPage() {
  const { auth, addEvent } = useAppState()
  const [date, setDate] = useState(todayIso())
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')

  if (!auth) return null

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) return
    const t = text.trim()
    if (!t) {
      setMsg('Bitte Text eingeben.')
      return
    }
    const ev: StallEvent = {
      id: newId(),
      type: 'note',
      date,
      party: auth.party,
      note: t,
    }
    addEvent(ev)
    setMsg('Notiz gespeichert.')
    setText('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
          <StickyNote className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Ereignisse & Notizen</h1>
          <p className="text-sm text-stone-500">Partei: {auth.party}</p>
        </div>
      </div>

      <Card title="Neue Notiz">
        <p className="mb-3 text-xs text-stone-500">
          Beispiele: Huhn krank, Stall repariert, Wasserbehälter gereinigt, neues Futter gekauft …
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="n-date">
              Datum
            </label>
            <input
              id="n-date"
              type="date"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="n-text">
              Freitext
            </label>
            <textarea
              id="n-text"
              rows={4}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
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
