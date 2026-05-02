/* eslint-disable react-refresh/only-export-components -- Provider + useTheme */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { LS_THEME } from '../lib/constants'

type Theme = 'light' | 'dark' | 'system'

function subscribeSystemDark(onStoreChange: () => void): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getSystemDarkSnapshot(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getSystemDarkServerSnapshot(): boolean {
  return false
}

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
  effectiveDark: boolean
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const s = localStorage.getItem(LS_THEME) as Theme | null
      if (s === 'light' || s === 'dark' || s === 'system') return s
    } catch {
      /* ignore */
    }
    return 'system'
  })

  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot,
  )

  const effectiveDark = useMemo(
    () => theme === 'dark' || (theme === 'system' && systemDark),
    [theme, systemDark],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveDark)
  }, [effectiveDark])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try {
      localStorage.setItem(LS_THEME, t)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, effectiveDark }),
    [theme, setTheme, effectiveDark],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useTheme außerhalb ThemeProvider')
  return c
}
