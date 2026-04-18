import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

const styles: Record<AlertVariant, { wrap: string; icon: string }> = {
  info:    { wrap: 'bg-blue-50 border-blue-200 text-blue-800',   icon: 'ℹ️' },
  success: { wrap: 'bg-green-50 border-green-200 text-green-800', icon: '✅' },
  warning: { wrap: 'bg-amber-50 border-amber-200 text-amber-800', icon: '⚠️' },
  danger:  { wrap: 'bg-red-50 border-red-200 text-red-800',       icon: '❌' },
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const s = styles[variant]
  return (
    <div className={clsx('flex gap-3 rounded-xl border p-4 text-sm', s.wrap, className)}>
      <span className="text-base leading-5">{s.icon}</span>
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
