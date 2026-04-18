import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type BadgeVariant = 'primary' | 'gold' | 'success' | 'warning' | 'danger' | 'slate'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  gold:    'bg-gold-100 text-gold-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  slate:   'bg-slate-100 text-slate-600',
}

export function Badge({ variant = 'slate', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  )
}

// Badge de rol
const rolVariant: Record<string, BadgeVariant> = {
  admin: 'gold', docente: 'primary', estudiante: 'success',
}
const rolLabel: Record<string, string> = {
  admin: 'Admin', docente: 'Docente', estudiante: 'Estudiante',
}

export function RolBadge({ role }: { role: string }) {
  return <Badge variant={rolVariant[role] ?? 'slate'}>{rolLabel[role] ?? role}</Badge>
}
