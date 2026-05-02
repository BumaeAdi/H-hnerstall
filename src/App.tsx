import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from './context/AppStateContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './pages/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { EggsPage } from './pages/EggsPage'
import { CleaningPage } from './pages/CleaningPage'
import { FeedingPage } from './pages/FeedingPage'
import { CostsPage } from './pages/CostsPage'
import { StockPage } from './pages/StockPage'
import { NotesPage } from './pages/NotesPage'
import { HistoryPage } from './pages/HistoryPage'
import { StatsPage } from './pages/StatsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppStateProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="eier" element={<EggsPage />} />
              <Route path="mistung" element={<CleaningPage />} />
              <Route path="fuetterung" element={<FeedingPage />} />
              <Route path="kosten" element={<CostsPage />} />
              <Route path="huehner" element={<StockPage />} />
              <Route path="notizen" element={<NotesPage />} />
              <Route path="historie" element={<HistoryPage />} />
              <Route path="statistik" element={<StatsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppStateProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
