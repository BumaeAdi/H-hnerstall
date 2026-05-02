import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Egg } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import type { Party } from '../lib/types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function LoginPage() {
  const { auth, login } = useAppState()
  const nav = useNavigate()
  const [party, setParty] = useState<Party>('Baumann')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  if (auth) {
    return <Navigate to="/app/dashboard" replace />
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!pin.trim()) {
      setError('Bitte PIN eingeben.')
      return
    }
    if (!login(party, pin)) {
      setError('PIN ist falsch.')
      return
    }
    nav('/app/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-stone-100 px-4 py-10 dark:from-stone-950 dark:to-stone-900">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-lg">
          <Egg className="size-9" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Hühnerstall
        </h1>
        <p className="max-w-sm text-sm text-stone-600 dark:text-stone-400">
          Gemeinsamer Stall für Familie Baumann und Familie Schmid – Erfassung,
          Auswertung und faire Kosten.
        </p>
      </div>

      <Card className="w-full max-w-sm" title="Anmelden" subtitle="Partei und PIN wählen">
        <form onSubmit={onSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="sr-only">Partei</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParty('Baumann')}
                className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
                  party === 'Baumann'
                    ? 'border-baumann-500 bg-baumann-50 text-baumann-800 dark:bg-baumann-900/30 dark:text-baumann-100'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-baumann-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'
                }`}
              >
                Familie Baumann
              </button>
              <button
                type="button"
                onClick={() => setParty('Schmid')}
                className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
                  party === 'Schmid'
                    ? 'border-schmid-500 bg-schmid-50 text-schmid-800 dark:bg-schmid-900/30 dark:text-schmid-100'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-schmid-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'
                }`}
              >
                Familie Schmid
              </button>
            </div>
          </fieldset>

          <div>
            <label htmlFor="pin" className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              PIN
            </label>
            <input
              id="pin"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-lg tracking-widest dark:border-stone-600 dark:bg-stone-900"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Demo: Baumann <strong>1234</strong>, Schmid <strong>5678</strong>
            </p>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full">
            Weiter zum Dashboard
          </Button>
        </form>
      </Card>

      <p className="mt-8 max-w-sm text-center text-xs text-stone-500 dark:text-stone-500">
        Daten werden lokal im Browser gespeichert (LocalStorage). Für den produktiven
        Einsatz später optional Server anbinden.
      </p>
    </div>
  )
}
