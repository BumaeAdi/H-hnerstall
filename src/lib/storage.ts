import type { AuthSession, StallEvent } from './types'
import { LS_AUTH, LS_EVENTS } from './constants'

export function loadAuth(): AuthSession | null {
  try {
    const raw = localStorage.getItem(LS_AUTH)
    if (!raw) return null
    const p = JSON.parse(raw) as AuthSession
    if (p.party !== 'Baumann' && p.party !== 'Schmid') return null
    return p
  } catch {
    return null
  }
}

export function saveAuth(session: AuthSession | null): void {
  if (!session) localStorage.removeItem(LS_AUTH)
  else localStorage.setItem(LS_AUTH, JSON.stringify(session))
}

export function loadEvents(): StallEvent[] {
  try {
    const raw = localStorage.getItem(LS_EVENTS)
    if (!raw) return []
    const arr = JSON.parse(raw) as StallEvent[]
    if (!Array.isArray(arr)) return []
    return arr
  } catch {
    return []
  }
}

export function saveEvents(events: StallEvent[]): void {
  localStorage.setItem(LS_EVENTS, JSON.stringify(events))
}
