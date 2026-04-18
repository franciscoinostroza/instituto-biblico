import { clsx } from 'clsx'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-10 h-6 rounded-full transition-colors focus:outline-none',
          'focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
          checked ? 'bg-primary-600' : 'bg-slate-300',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className={clsx(
          'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
          checked && 'translate-x-4',
        )} />
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  )
}
