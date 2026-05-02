import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  title,
  subtitle,
}: {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      {(title || subtitle) && (
        <header className="mb-3">
          {title && (
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
