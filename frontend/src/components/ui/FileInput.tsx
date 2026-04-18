import { useRef, type ChangeEvent } from 'react'
import { clsx } from 'clsx'

interface FileInputProps {
  label?: string
  error?: string
  accept?: string
  onChange: (file: File | null) => void
  value?: File | null
  hint?: string
}

export function FileInput({ label, error, accept, onChange, value, hint }: FileInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files?.[0] ?? null)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div
        onClick={() => ref.current?.click()}
        className={clsx(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
          'cursor-pointer p-6 text-center transition-colors',
          error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-primary-400 hover:bg-primary-50',
        )}
      >
        <span className="text-2xl">📎</span>
        {value ? (
          <p className="text-sm text-slate-700 font-medium">{value.name}</p>
        ) : (
          <p className="text-sm text-slate-500">Hacé click para seleccionar un archivo</p>
        )}
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <input ref={ref} type="file" accept={accept} onChange={handleChange} className="hidden" />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
