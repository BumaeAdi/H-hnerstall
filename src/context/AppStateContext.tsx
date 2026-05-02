/* eslint-disable react-refresh/only-export-components -- Provider + useAppState-Hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthSession, Party, StallEvent } from '../lib/types'
import { PARTY_PINS } from '../lib/constants'
import { loadAuth, loadEvents, saveAuth, saveEvents } from '../lib/storage'

interface AppStateValue {
  auth: AuthSession | null
  events: StallEvent[]
  login: (party: Party, pin: string) => boolean
  logout: () => void
  addEvent: (e: StallEvent) => void
  removeEvent: (id: string) => void
  replaceEvents: (events: StallEvent[]) => void
  clearAllData: () => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthSession | null>(() => loadAuth())
  const [events, setEvents] = useState<StallEvent[]>(() => loadEvents())

  useEffect(() => {
    saveEvents(events)
  }, [events])

  const login = useCallback((party: Party, pin: string) => {
    if (PARTY_PINS[party] !== pin.trim()) return false
    const session: AuthSession = { party }
    setAuth(session)
    saveAuth(session)
    return true
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    saveAuth(null)
  }, [])

  const addEvent = useCallback((e: StallEvent) => {
    setEvents((prev) => [...prev, e])
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const replaceEvents = useCallback((next: StallEvent[]) => {
    setEvents(next)
  }, [])

  const clearAllData = useCallback(() => {
    setEvents([])
    saveEvents([])
  }, [])

  const value = useMemo(
    () => ({
      auth,
      events,
      login,
      logout,
      addEvent,
      removeEvent,
      replaceEvents,
      clearAllData,
    }),
    [auth, events, login, logout, addEvent, removeEvent, replaceEvents, clearAllData],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState außerhalb AppStateProvider')
  return ctx
}
