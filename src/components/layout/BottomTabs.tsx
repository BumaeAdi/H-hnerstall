import { NavLink } from 'react-router-dom'
import {
  Egg,
  Sparkles,
  Wheat,
  Wallet,
  Bird,
  StickyNote,
  History,
  BarChart3,
  LayoutDashboard,
} from 'lucide-react'

const tabs = [
  { to: '/app/dashboard', label: 'Start', icon: LayoutDashboard },
  { to: '/app/eier', label: 'Eier', icon: Egg },
  { to: '/app/mistung', label: 'Mistung', icon: Sparkles },
  { to: '/app/fuetterung', label: 'Futter', icon: Wheat },
  { to: '/app/kosten', label: 'Kosten', icon: Wallet },
  { to: '/app/huehner', label: 'Hühner', icon: Bird },
  { to: '/app/notizen', label: 'Notizen', icon: StickyNote },
  { to: '/app/historie', label: 'Historie', icon: History },
  { to: '/app/statistik', label: 'Statistik', icon: BarChart3 },
] as const

export function BottomTabs() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-stone-800 dark:bg-stone-950/95 lg:hidden"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto flex max-w-lg justify-around overflow-x-auto px-1 pt-1">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[10px] font-medium ${
                isActive
                  ? 'text-baumann-600 dark:text-baumann-400'
                  : 'text-stone-500 dark:text-stone-400'
              }`
            }
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
