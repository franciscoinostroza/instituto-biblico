import { NotificacionesCampanita } from './NotificacionesCampanita'
import { UserMenu } from './UserMenu'

interface NavbarProps {
  onMenuToggle?: () => void
  title?: string
}

export function Navbar({ onMenuToggle, title }: NavbarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-3 flex-shrink-0 z-30">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        aria-label="Menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {title && (
        <span className="text-sm font-semibold text-slate-700 lg:hidden">{title}</span>
      )}

      <div className="flex-1" />

      <NotificacionesCampanita />
      <UserMenu />
    </header>
  )
}
