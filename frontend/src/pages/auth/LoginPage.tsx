import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { Button, Input, Alert } from '@/components/ui'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const mutation = useMutation({
    mutationFn: () => authService.login(email, password),
    onSuccess: (res: any) => {
      login(res.data.user, res.data.token)
      navigate('/dashboard', { replace: true })
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    mutation.mutate()
  }

  const errorMsg = (() => {
    const err = mutation.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-700 opacity-50" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-primary-500 opacity-40" />
        <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full bg-gold-500 opacity-20" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="w-20 h-20 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-white text-3xl font-bold">IB</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Instituto Bíblico Shalom
          </h1>
          <p className="text-primary-200 text-base leading-relaxed">
            Formando siervos de Dios con excelencia académica y espiritual.
          </p>

          {/* Versículo */}
          <div className="mt-10 p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
            <p className="text-white text-sm italic leading-relaxed">
              "Procura con diligencia presentarte a Dios aprobado, como obrero que no tiene de qué avergonzarse."
            </p>
            <p className="text-gold-400 text-xs mt-2 font-medium">— 2 Timoteo 2:15</p>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">IB</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Instituto Bíblico Shalom</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900">Bienvenido</h2>
              <p className="text-sm text-slate-500 mt-1">Ingresá con tu cuenta institucional</p>
            </div>

            {errorMsg && (
              <Alert variant="danger" className="mb-5">
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@instituto.com"
                autoComplete="email"
                required
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={mutation.isPending}
                className="mt-2"
              >
                Ingresar
              </Button>
            </form>

            <p className="text-xs text-slate-400 text-center mt-6">
              ¿Problemas para ingresar? Contactá a secretaría.
            </p>
          </div>

          {/* Credenciales de demo */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <p className="font-semibold mb-2">Credenciales de prueba:</p>
              <div className="flex flex-col gap-1">
                {[
                  ['Admin',      'admin@instituto.com'],
                  ['Docente',    'docente@instituto.com'],
                  ['Estudiante', 'estudiante@instituto.com'],
                ].map(([rol, email]) => (
                  <button
                    key={email}
                    onClick={() => { setEmail(email); setPassword('password') }}
                    className="text-left hover:underline"
                  >
                    <span className="font-medium">{rol}:</span> {email}
                  </button>
                ))}
                <p className="text-amber-600 mt-1">Contraseña: <code className="bg-amber-100 px-1 rounded">password</code></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
