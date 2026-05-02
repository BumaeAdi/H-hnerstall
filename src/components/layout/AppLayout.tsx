import { Outlet } from 'react-router-dom'
import { HeaderBar } from './HeaderBar'
import { BottomTabs } from './BottomTabs'
import { SideNav } from './SideNav'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col pb-20 lg:pb-0">
      <HeaderBar />
      <div className="mx-auto flex w-full max-w-lg flex-1 gap-6 px-4 py-4 lg:max-w-6xl lg:px-6">
        <SideNav />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <BottomTabs />
    </div>
  )
}
