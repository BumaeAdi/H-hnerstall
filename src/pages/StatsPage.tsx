import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import { COST_CATEGORY_LABELS } from '../lib/constants'
import {
  averageCostPerChickenMonthChf,
  averageCostPerEggChf,
  costsByCategoryMonth,
  currentChickenCount,
  eggsByPartyMonth,
  eggsPerDaySeries,
  feedKgInRange,
  totalCostsInMonth,
} from '../lib/calculations'
import { todayIso } from '../lib/dates'
import type { CostCategory } from '../lib/types'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6']

export function StatsPage() {
  const { events } = useAppState()
  const month = todayIso().slice(0, 7)
  const t = todayIso()
  const d = new Date()
  d.setDate(d.getDate() - 27)
  const fromWeek = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const eggsDaily = useMemo(() => eggsPerDaySeries(events, 14), [events])
  const eggsParty = useMemo(() => {
    const p = eggsByPartyMonth(events, `${month}-01`)
    return [
      { name: 'Baumann', eier: p.Baumann },
      { name: 'Schmid', eier: p.Schmid },
    ]
  }, [events, month])

  const feedWeek = useMemo(() => feedKgInRange(events, fromWeek, t), [events, fromWeek, t])

  const costTimeline = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of events) {
      if (e.type === 'cost' && e.amountCHF) {
        const k = e.date.slice(0, 7)
        map.set(k, (map.get(k) ?? 0) + e.amountCHF)
      }
      if (e.type === 'feeding' && e.feedCost) {
        const k = e.date.slice(0, 7)
        map.set(k, (map.get(k) ?? 0) + e.feedCost)
      }
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monat, chf]) => ({ monat, chf: Math.round(chf * 100) / 100 }))
  }, [events])

  const cats = costsByCategoryMonth(events, `${month}-01`)
  const pieData = (Object.keys(COST_CATEGORY_LABELS) as CostCategory[])
    .map((c) => ({ name: COST_CATEGORY_LABELS[c], value: Math.round(cats[c] * 100) / 100 }))
    .filter((x) => x.value > 0)

  const perEgg = averageCostPerEggChf(events)
  const perHen = averageCostPerChickenMonthChf(events, `${month}-01`)
  const chickens = currentChickenCount(events)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
          <BarChart3 className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Statistik</h1>
          <p className="text-sm text-stone-500">Diagramme & Kennzahlen</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Futter (kg, ~4 Wochen)">
          <p className="text-2xl font-bold tabular-nums">{feedWeek.toFixed(1)} kg</p>
        </Card>
        <Card title={`Futterkosten (Monat ${month})`}>
          <p className="text-2xl font-bold tabular-nums">
            {(
              events
                .filter((e) => e.date.startsWith(month))
                .filter((e) => e.type === 'feeding' && e.feedCost)
                .reduce((s, e) => s + (e.feedCost ?? 0), 0) +
              events
                .filter((e) => e.date.startsWith(month))
                .filter((e) => e.type === 'cost' && e.costCategory === 'feed')
                .reduce((s, e) => s + (e.amountCHF ?? 0), 0)
            ).toFixed(2)}{' '}
            CHF
          </p>
        </Card>
        <Card title="Ø Kosten pro Ei (gesamt)">
          <p className="text-2xl font-bold tabular-nums">
            {perEgg != null ? `${perEgg.toFixed(2)} CHF` : '—'}
          </p>
        </Card>
        <Card title="Ø Kosten pro Huhn (Monat)">
          <p className="text-2xl font-bold tabular-nums">
            {perHen != null && chickens ? `${perHen.toFixed(2)} CHF` : '—'}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Gesamtkosten Monat / aktueller Bestand ({chickens} Hühner)
          </p>
        </Card>
      </div>

      <Card title="Eier pro Tag (14 Tage)">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={eggsDaily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(8)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip labelFormatter={(v) => String(v)} />
              <Legend />
              <Line type="monotone" dataKey="eggs" name="Eier" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title={`Eier pro Partei (${month})`}>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eggsParty} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="eier" name="Eier" radius={[6, 6, 0, 0]}>
                <Cell fill="#2563eb" />
                <Cell fill="#10b981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title={`Kosten pro Kategorie (${month})`}>
        {pieData.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-500">Noch keine Kosten in diesem Monat.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value ?? ''} CHF`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card title="Kostenentwicklung (Monat)">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={costTimeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
              <XAxis dataKey="monat" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value ?? ''} CHF`, 'Summe']} />
              <Legend />
              <Line type="monotone" dataKey="chf" name="CHF" stroke="#f59e0b" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Gesamtkosten aktueller Monat">
        <p className="text-3xl font-bold tabular-nums">
          {totalCostsInMonth(events, `${month}-01`).toFixed(2)} CHF
        </p>
      </Card>
    </div>
  )
}
