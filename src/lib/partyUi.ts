import type { Party } from './types'

/** Kleine Partei-Badges (Listen, Kalender, Dashboard). Hoher Kontrast im Dark Mode. */
export function partyChipClass(party: Party): string {
  return party === 'Baumann'
    ? 'bg-baumann-100 text-baumann-900 dark:bg-baumann-900 dark:text-baumann-50 dark:ring-1 dark:ring-inset dark:ring-white/15'
    : 'bg-schmid-100 text-schmid-900 dark:bg-schmid-900 dark:text-schmid-50 dark:ring-1 dark:ring-inset dark:ring-white/15'
}

/** Login: ausgewählte Familie (grosse Schaltfläche). */
export function partyLoginSelectedClass(party: Party): string {
  return party === 'Baumann'
    ? 'border-baumann-500 bg-baumann-50 text-baumann-900 dark:border-sky-400 dark:bg-baumann-950 dark:text-baumann-50'
    : 'border-schmid-500 bg-schmid-50 text-schmid-900 dark:border-emerald-400 dark:bg-schmid-950 dark:text-schmid-50'
}
