import { Link } from 'react-router-dom'
import {
  Egg,
  Sparkles,
  AlertTriangle,
  Wallet,
  ArrowRight,
  Bird,
} from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import {
  averageEggsPerDayLast7,
  buildWarnings,
  computeSettlement,
  currentChickenCount,
  eggsPerChickenToday,
  eggsToday,
  eggsLast7Days,
  lastCleaningDate,
  recentActivities,
  totalCostsInMonth,
} from '../lib/calculations'
import { formatDeDate, todayIso } from '../lib/dates'
import { EVENT_TYPE_LABELS } from '../lib/constants'
import { DashboardEventsCalendar } from '../components/DashboardEventsCalendar'

function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: 'baumann' | 'schmid' | 'saldo'
}) {
  const border =
    accent === 'baumann'
      ? 'border-l-4 border-l-baumann-500'
      : accent === 'schmid'
        ? 'border-l-4 border-l-schmid-500'
        : accent === 'saldo'
          ? 'border-l-4 border-l-amber-500'
          : ''
  return (
    <div
      className={`rounded-xl border border-stone-100 bg-stone-50/80 p-3 dark:border-stone-800 dark:bg-stone-800/50 ${border}`}
    >
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-stone-900 dark:text-stone-50">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
    </div>
  )
}

export function DashboardPage() {
  const { events } = useAppState()
  const month = todayIso().slice(0, 7)
  const settlement = computeSettlement(events)
  const warnings = buildWarnings(events, settlement)
  const lastClean = lastCleaningDate(events)
  const eggsPerHen = eggsPerChickenToday(events)

  const saldoLabel =
    settlement.balanceOwedToBaumannChf === 0
      ? 'Ausgeglichen'
      : settlement.balanceOwedToBaumannChf > 0
        ? `Schmid schuldet Baumann ${settlement.balanceOwedToBaumannChf.toFixed(2)} CHF`
        : `Baumann schuldet Schmid ${Math.abs(settlement.balanceOwedToBaumannChf).toFixed(2)} CHF`

  const activities = recentActivities(events, 8)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Dashboard</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Überblick für {formatDeDate(todayIso())}
        </p>
      </div>

      <Card title="Kalender" subtitle="Alle Einträge nach Tag – Monat wechseln, Tag antippen">
        <DashboardEventsCalendar events={events} />
      </Card>

      {warnings.length > 0 && (
        <Card title="Hinweise & Warnungen">
          <ul className="space-y-2">
            {warnings.map((w) => (
              <li
                key={w.id}
                className={`flex gap-2 rounded-lg px-2 py-2 text-sm ${
                  w.severity === 'warn'
                    ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
                    : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
                }`}
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {w.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile
          label="Letzte Mistung"
          value={lastClean ? formatDeDate(lastClean) : '—'}
          hint={lastClean ? undefined : 'Noch keine Erfassung'}
          accent="schmid"
        />
        <StatTile
          label="Eier heute"
          value={`${eggsToday(events)} Stk.`}
          accent="baumann"
        />
        <StatTile
          label="Eier letzte 7 Tage"
          value={`${eggsLast7Days(events)} Stk.`}
        />
        <StatTile
          label="Ø Eier / Tag (7 Tage)"
          value={`${averageEggsPerDayLast7(events)}`}
        />
        <StatTile
          label="Eier pro Huhn (heute)"
          value={eggsPerHen != null ? String(eggsPerHen) : '—'}
          hint={
            currentChickenCount(events) === 0
              ? 'Bestand unter „Hühner“ pflegen'
              : undefined
          }
        />
        <StatTile
          label="Aktueller Hühnerbestand"
          value={`${currentChickenCount(events)} Hühner`}
        />
      </div>

      <Card title="Kosten & Saldo" subtitle={`Monat ${month}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatTile
            label="Gesamtkosten (Monat)"
            value={`${totalCostsInMonth(events, month + '-01').toFixed(2)} CHF`}
            accent="saldo"
          />
          <StatTile
            label="Bezahlt von Baumann"
            value={`${settlement.paidBaumann.toFixed(2)} CHF`}
            accent="baumann"
          />
          <StatTile
            label="Bezahlt von Schmid"
            value={`${settlement.paidSchmid.toFixed(2)} CHF`}
            accent="schmid"
          />
          <StatTile
            label="Soll-Anteil Baumann"
            value={`${settlement.obligationBaumann.toFixed(2)} CHF`}
          />
          <StatTile
            label="Soll-Anteil Schmid"
            value={`${settlement.obligationSchmid.toFixed(2)} CHF`}
          />
          <div className="rounded-xl border-2 border-amber-400 bg-saldo-bg p-3 dark:border-amber-600 dark:bg-amber-950/30">
            <p className="flex items-center gap-1 text-xs font-medium text-saldo-positive dark:text-amber-200">
              <Wallet className="size-3.5" aria-hidden />
              Offener Ausgleich
            </p>
            <p className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-50">
              {saldoLabel}
            </p>
          </div>
        </div>
        <Link
          to="/app/kosten"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-baumann-600 hover:underline dark:text-baumann-400"
        >
          Zum Kostenmodul <ArrowRight className="size-4" />
        </Link>
      </Card>

      <Card title="Letzte Aktivitäten">
        {activities.length === 0 ? (
          <p className="text-sm text-stone-500">Noch keine Einträge.</p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {activities.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  {EVENT_TYPE_LABELS[e.type]}
                </span>
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
                {e.type === 'eggs' && e.eggCount != null && (
                  <span className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <Egg className="size-3.5" aria-hidden />
                    {e.eggCount}
                  </span>
                )}
                {e.type === 'cleaning' && (
                  <Sparkles className="size-3.5 text-stone-400" aria-hidden />
                )}
                {e.type === 'stock' && e.chickenCount != null && (
                  <span className="inline-flex items-center gap-1 text-stone-600">
                    <Bird className="size-3.5" aria-hidden />
                    {e.chickenCount}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/app/historie"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-baumann-600 dark:text-baumann-400"
        >
          Vollständige Historie <ArrowRight className="size-4" />
        </Link>
      </Card>
    </div>
  )
}
