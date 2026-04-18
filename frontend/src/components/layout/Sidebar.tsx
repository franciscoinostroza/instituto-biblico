import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
}

interface SidebarProps {
  items: NavItem[]
  accentClass: string       // e.g. 'text-gold-400' para admin
  role: string
  roleLabel: string
  open: boolean
  onClose: () => void
  logo?: ReactNode
}

export function Sidebar({ items, accentClass, roleLabel, open, onClose, logo }: SidebarProps) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 bg-primary-600 flex flex-col z-40 transition-transform duration-300',
        'lg:relative lg:translate-x-0 lg:flex-shrink-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo / marca */}
        <div className="h-14 flex items-center gap-3 px-5 border-b border-primary-700">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            IB
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold leading-tight">Instituto Bíblico</p>
            <p className={clsx('text-xs font-medium', accentClass)}>{roleLabel}</p>
          </div>
          {/* Cerrar en mobile */}
          <button onClick={onClose} className="ml-auto text-primary-300 hover:text-white lg:hidden">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-primary-200 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {logo && <div className="p-4 border-t border-primary-700">{logo}</div>}
      </aside>
    </>
  )
}
