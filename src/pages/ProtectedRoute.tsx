import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { auth } = useAppState()
  if (!auth) return <Navigate to="/" replace />
  return children
}
