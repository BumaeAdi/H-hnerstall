import { LogOut, Moon, Sun, Monitor } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../context/AppStateContext'
import { useTheme } from '../../context/ThemeContext'
import type { Party } from '../../lib/types'

function partyBadgeClass(p: Party): string {
  return p === 'Baumann'
    ? 'bg-baumann-100 text-baumann-700 dark:bg-baumann-600/30 dark:text-baumann-100'
    : 'bg-schmid-100 text-schmid-700 dark:bg-schmid-600/30 dark:text-schmid-100'
}

export function HeaderBar() {
  const { auth, logout } = useAppState()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3 lg:max-w-4xl">
        <Link to="/app/dashboard" className="font-semibold text-stone-900 dark:text-stone-100">
          Hühnerstall
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-lg border border-stone-200 p-0.5 dark:border-stone-700"
            role="group"
            aria-label="Darstellung"
          >
            <button
              type="button"
              title="Hell"
              onClick={() => setTheme('light')}
              className={`rounded-md p-1.5 ${theme === 'light' ? 'bg-stone-200 dark:bg-stone-700' : ''}`}
            >
              <Sun className="size-4" />
            </button>
            <button
              type="button"
              title="System"
              onClick={() => setTheme('system')}
              className={`rounded-md p-1.5 ${theme === 'system' ? 'bg-stone-200 dark:bg-stone-700' : ''}`}
            >
              <Monitor className="size-4" />
            </button>
            <button
              type="button"
              title="Dunkel"
              onClick={() => setTheme('dark')}
              className={`rounded-md p-1.5 ${theme === 'dark' ? 'bg-stone-200 dark:bg-stone-700' : ''}`}
            >
              <Moon className="size-4" />
            </button>
          </div>
          {auth && (
            <>
              <span
                className={`hidden max-w-[9rem] truncate rounded-full px-2.5 py-1 text-xs font-medium sm:inline ${partyBadgeClass(auth.party)}`}
              >
                {auth.party}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-100 dark:hover:bg-stone-800"
              >
                <LogOut className="size-4" aria-hidden />
                <span className="hidden sm:inline">Abmelden</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
