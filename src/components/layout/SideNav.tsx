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

const links = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/eier', label: 'Eier erfassen', icon: Egg },
  { to: '/app/mistung', label: 'Mistung', icon: Sparkles },
  { to: '/app/fuetterung', label: 'Fütterung', icon: Wheat },
  { to: '/app/kosten', label: 'Kosten', icon: Wallet },
  { to: '/app/huehner', label: 'Hühnerbestand', icon: Bird },
  { to: '/app/notizen', label: 'Notizen', icon: StickyNote },
  { to: '/app/historie', label: 'Historie', icon: History },
  { to: '/app/statistik', label: 'Statistik', icon: BarChart3 },
] as const

export function SideNav() {
  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      <nav
        className="sticky top-20 space-y-1 rounded-2xl border border-stone-200 bg-white p-2 dark:border-stone-800 dark:bg-stone-900"
        aria-label="Seitenmenü"
      >
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-baumann-50 text-baumann-900 dark:bg-baumann-950 dark:text-baumann-50 dark:ring-1 dark:ring-inset dark:ring-white/10'
                  : 'text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800'
              }`
            }
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
