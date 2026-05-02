import type { CostCategory, EventType, Party, SplitMode } from './types'

export const PARTY_PINS: Record<Party, string> = {
  Baumann: '1234',
  Schmid: '5678',
}

export const LS_AUTH = 'huehnerstall_auth_v1'
export const LS_EVENTS = 'huehnerstall_events_v1'
export const LS_THEME = 'huehnerstall_theme_v1'

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  feed: 'Futter',
  bedding: 'Einstreu',
  medicine: 'Medikamente',
  repair: 'Reparaturen',
  equipment: 'Zubehör',
  vet: 'Tierarzt',
  other: 'Sonstiges',
}

export const SPLIT_MODE_LABELS: Record<SplitMode, string> = {
  '50_50': '50 / 50',
  baumann_only: 'Komplett Baumann',
  schmid_only: 'Komplett Schmid',
  custom: 'Benutzerdefiniert',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  eggs: 'Eier',
  cleaning: 'Mistung',
  feeding: 'Fütterung',
  cost: 'Kosten',
  note: 'Notiz',
  stock: 'Hühnerbestand',
}
