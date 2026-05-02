import { useMemo, useState } from 'react'
import { Wallet } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  COST_CATEGORY_LABELS,
  SPLIT_MODE_LABELS,
} from '../lib/constants'
import {
  computeSettlement,
  costsByCategoryMonth,
  obligationSharesChf,
  totalCostsInMonth,
} from '../lib/calculations'
import { formatDeDate, todayIso } from '../lib/dates'
import { newId } from '../lib/id'
import type { CostCategory, Party, SplitMode, StallEvent } from '../lib/types'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const categories = Object.keys(COST_CATEGORY_LABELS) as CostCategory[]

export function CostsPage() {
  const { auth, events, addEvent } = useAppState()
  const [tab, setTab] = useState<'form' | 'board'>('form')

  const [date, setDate] = useState(todayIso())
  const [category, setCategory] = useState<CostCategory>('feed')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState<Party>(() => auth?.party ?? 'Baumann')
  const [splitMode, setSplitMode] = useState<SplitMode>('50_50')
  const [bPct, setBPct] = useState('50')
  const [sPct, setSPct] = useState('50')
  const [description, setDescription] = useState('')
  const [receiptNote, setReceiptNote] = useState('')
  const [msg, setMsg] = useState('')

  const [filterMonth, setFilterMonth] = useState(() => todayIso().slice(0, 7))
  const [filterCat, setFilterCat] = useState<CostCategory | 'all'>('all')
  const [filterParty, setFilterParty] = useState<Party | 'all'>('all')

  const settlement = useMemo(() => computeSettlement(events), [events])

  const monthCosts = useMemo(
    () => costsByCategoryMonth(events, `${filterMonth}-01`),
    [events, filterMonth],
  )

  const chartData = useMemo(
    () =>
      categories.map((c) => ({
        name: COST_CATEGORY_LABELS[c],
        chf: Math.round(monthCosts[c] * 100) / 100,
      })),
    [monthCosts],
  )

  const filteredHistory = useMemo(() => {
    return events
      .filter((e) => e.type === 'cost')
      .filter((e) => {
        if (filterMonth && e.date.slice(0, 7) !== filterMonth) return false
        if (filterCat !== 'all' && e.costCategory !== filterCat) return false
        if (filterParty !== 'all' && (e.paidBy ?? e.party) !== filterParty)
          return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [events, filterMonth, filterCat, filterParty])

  if (!auth) return null

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) return
    const a = Number(amount.replace(',', '.'))
    if (!Number.isFinite(a) || a <= 0) {
      setMsg('Bitte gültigen Betrag eingeben.')
      return
    }
    let baumannSharePercent: number | undefined
    let schmidSharePercent: number | undefined
    if (splitMode === 'custom') {
      const b = Number(bPct)
      const s = Number(sPct)
      if (!Number.isFinite(b) || !Number.isFinite(s) || b < 0 || s < 0) {
        setMsg('Prozentangaben prüfen.')
        return
      }
      baumannSharePercent = b
      schmidSharePercent = s
    }
    const ev: StallEvent = {
      id: newId(),
      type: 'cost',
      date,
      party: auth.party,
      costCategory: category,
      amountCHF: Math.round(a * 100) / 100,
      paidBy,
      splitMode,
      baumannSharePercent,
      schmidSharePercent,
      description: description.trim() || undefined,
      receiptNote: receiptNote.trim() || undefined,
    }
    addEvent(ev)
    setMsg('Kosten gespeichert.')
    setAmount('')
    setDescription('')
    setReceiptNote('')
  }

  const previewAmt = Number(amount.replace(',', '.'))
  const previewOk = Number.isFinite(previewAmt) && previewAmt > 0
  const preview = previewOk
    ? obligationSharesChf(
        previewAmt,
        splitMode,
        splitMode === 'custom' ? Number(bPct) : undefined,
        splitMode === 'custom' ? Number(sPct) : undefined,
      )
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
          <Wallet className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Kosten</h1>
          <p className="text-sm text-stone-500">Erfassung & Übersicht</p>
        </div>
      </div>

      <div className="flex rounded-xl border border-stone-200 p-1 dark:border-stone-700">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            tab === 'form'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-600 dark:text-stone-300'
          }`}
          onClick={() => setTab('form')}
        >
          Erfassen
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            tab === 'board'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-600 dark:text-stone-300'
          }`}
          onClick={() => setTab('board')}
        >
          Dashboard
        </button>
      </div>

      {tab === 'form' && (
        <Card title="Kosten erfassen">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="c-date">
                Datum
              </label>
              <input
                id="c-date"
                type="date"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="c-cat">
                Kategorie
              </label>
              <select
                id="c-cat"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
                value={category}
                onChange={(e) => setCategory(e.target.value as CostCategory)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {COST_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="c-amt">
                Betrag (CHF)
              </label>
              <input
                id="c-amt"
                inputMode="decimal"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="c-paid">
                Bezahlt von
              </label>
              <select
                id="c-paid"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value as Party)}
              >
                <option value="Baumann">Baumann</option>
                <option value="Schmid">Schmid</option>
              </select>
              <p className="mt-1 text-xs text-stone-500">
                Erfasser: {auth.party} (wird im Eintrag gespeichert)
              </p>
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium">Aufteilung (Soll)</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(SPLIT_MODE_LABELS) as SplitMode[]).map((m) => (
                  <label
                    key={m}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      splitMode === m
                        ? 'border-baumann-500 bg-baumann-50 dark:border-sky-400 dark:bg-baumann-950 dark:text-baumann-50'
                        : 'border-stone-200 text-stone-800 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="split"
                      checked={splitMode === m}
                      onChange={() => setSplitMode(m)}
                    />
                    {SPLIT_MODE_LABELS[m]}
                  </label>
                ))}
              </div>
            </div>
            {splitMode === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium" htmlFor="c-bp">
                    Baumann %
                  </label>
                  <input
                    id="c-bp"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
                    value={bPct}
                    onChange={(e) => setBPct(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" htmlFor="c-sp">
                    Schmid %
                  </label>
                  <input
                    id="c-sp"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
                    value={sPct}
                    onChange={(e) => setSPct(e.target.value)}
                  />
                </div>
              </div>
            )}
            {preview && (
              <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Vorschau Soll: Baumann {preview.baumann.toFixed(2)} CHF · Schmid{' '}
                {preview.schmid.toFixed(2)} CHF
              </p>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="c-desc">
                Beschreibung
              </label>
              <input
                id="c-desc"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="c-rec">
                Beleg / Notiz (optional)
              </label>
              <input
                id="c-rec"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 dark:border-stone-600 dark:bg-stone-900"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
              />
            </div>
            {msg && <p className="text-sm text-green-700 dark:text-green-400">{msg}</p>}
            <Button type="submit" className="w-full">
              Speichern
            </Button>
          </form>
        </Card>
      )}

      {tab === 'board' && (
        <div className="space-y-4">
          <Card title="Saldo (alle erfassten Kosten & Futterkäufe)">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-baumann-50 p-3 dark:bg-baumann-950 dark:ring-1 dark:ring-inset dark:ring-white/10">
                <p className="text-xs font-medium text-baumann-800 dark:text-baumann-50">
                  Bezahlt Baumann
                </p>
                <p className="text-lg font-bold tabular-nums text-stone-900 dark:text-white">
                  {settlement.paidBaumann.toFixed(2)} CHF
                </p>
                <p className="text-xs text-stone-600 dark:text-baumann-100/90">
                  Soll {settlement.obligationBaumann.toFixed(2)} CHF
                </p>
              </div>
              <div className="rounded-xl bg-schmid-50 p-3 dark:bg-schmid-950 dark:ring-1 dark:ring-inset dark:ring-white/10">
                <p className="text-xs font-medium text-schmid-800 dark:text-schmid-50">
                  Bezahlt Schmid
                </p>
                <p className="text-lg font-bold tabular-nums text-stone-900 dark:text-white">
                  {settlement.paidSchmid.toFixed(2)} CHF
                </p>
                <p className="text-xs text-stone-600 dark:text-schmid-100/90">
                  Soll {settlement.obligationSchmid.toFixed(2)} CHF
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border-2 border-amber-400 bg-amber-50 p-3 dark:border-amber-600 dark:bg-amber-950/40">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                {settlement.balanceOwedToBaumannChf === 0 && 'Ausgeglichen (rechnerisch).'}
                {settlement.balanceOwedToBaumannChf > 0 &&
                  `Schmid schuldet Baumann ${settlement.balanceOwedToBaumannChf.toFixed(2)} CHF.`}
                {settlement.balanceOwedToBaumannChf < 0 &&
                  `Baumann schuldet Schmid ${Math.abs(settlement.balanceOwedToBaumannChf).toFixed(2)} CHF.`}
              </p>
            </div>
          </Card>

          <Card title={`Monat ${filterMonth}`} subtitle="Gesamtkosten inkl. Futter aus Fütterung">
            <p className="text-2xl font-bold tabular-nums">
              {totalCostsInMonth(events, `${filterMonth}-01`).toFixed(2)} CHF
            </p>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} unit=" CHF" />
                  <Tooltip formatter={(value) => [`${value ?? ''} CHF`, 'Betrag']} />
                  <Legend />
                  <Bar dataKey="chf" name="CHF" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Historie (Kosten-Einträge)">
            <div className="mb-3 flex flex-wrap gap-2">
              <input
                type="month"
                className="rounded-lg border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-900"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
              <select
                className="rounded-lg border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-900"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value as CostCategory | 'all')}
              >
                <option value="all">Alle Kategorien</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {COST_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-900"
                value={filterParty}
                onChange={(e) => setFilterParty(e.target.value as Party | 'all')}
              >
                <option value="all">Bezahlt von: alle</option>
                <option value="Baumann">Baumann</option>
                <option value="Schmid">Schmid</option>
              </select>
            </div>
            <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
              {filteredHistory.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-stone-100 px-2 py-2 dark:border-stone-800"
                >
                  <span className="font-medium">{formatDeDate(e.date)}</span>
                  <span>{e.costCategory && COST_CATEGORY_LABELS[e.costCategory]}</span>
                  <span className="tabular-nums font-semibold">{e.amountCHF?.toFixed(2)} CHF</span>
                  <span className="text-xs text-stone-500">
                    von {e.paidBy ?? e.party} · {e.splitMode && SPLIT_MODE_LABELS[e.splitMode]}
                  </span>
                </li>
              ))}
              {filteredHistory.length === 0 && (
                <li className="text-stone-500">Keine Einträge für die Filter.</li>
              )}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}
