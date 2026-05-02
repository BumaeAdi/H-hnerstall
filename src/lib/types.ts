export type Party = 'Baumann' | 'Schmid'

export type EventType =
  | 'eggs'
  | 'cleaning'
  | 'feeding'
  | 'cost'
  | 'note'
  | 'stock'

export type CostCategory =
  | 'feed'
  | 'bedding'
  | 'medicine'
  | 'repair'
  | 'equipment'
  | 'vet'
  | 'other'

export type SplitMode = '50_50' | 'baumann_only' | 'schmid_only' | 'custom'

export interface StallEvent {
  id: string
  type: EventType
  date: string
  party: Party
  eggCount?: number
  feedAmountKg?: number
  feedCost?: number
  supplier?: string
  costCategory?: CostCategory
  amountCHF?: number
  paidBy?: Party
  splitMode?: SplitMode
  baumannSharePercent?: number
  schmidSharePercent?: number
  description?: string
  receiptNote?: string
  note?: string
  chickenCount?: number
}

export interface AuthSession {
  party: Party
}

export type HistoryFilterType = EventType | 'all'
