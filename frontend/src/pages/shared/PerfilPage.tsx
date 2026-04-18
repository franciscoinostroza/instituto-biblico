import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Input, Alert, Avatar, Card } from '@/components/ui'

export default function PerfilPage() {
  const { user, setUser } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    password: '',
    password_confirmation: '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)
  const [success, setSuccess]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('name', form.name)
      if (form.phone) fd.append('phone', form.phone)
      if (form.password) {
        fd.append('password', form.password)
        fd.append('password_confirmation', form.password_confirmation)
      }
      if (avatarFile) fd.append('avatar', avatarFile)
      return authService.updateProfile(fd)
    },
    onSuccess: (r) => {
      setUser(r.data)
      setSuccess(true)
      setError(null)
      setForm((f) => ({ ...f, password: '', password_confirmation: '' }))
      setAvatarFile(null); setAvatarPreview(null)
    },
    onError: (e: any) => {
      setError(e?.response?.data?.message ?? 'Error al guardar.')
      setSuccess(false)
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Mi perfil" description="Actualizá tu información personal" />

      <Card>
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={avatarPreview ?? user?.avatar} name={user?.name} size="lg" />
          <div>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              Cambiar foto
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={handleAvatarChange} />
            {avatarFile && (
              <p className="text-xs text-slate-400 mt-1">{avatarFile.name}</p>
            )}
          </div>
        </div>

        {success && <Alert variant="success" className="mb-4">Perfil actualizado correctamente.</Alert>}
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <div className="flex flex-col gap-4">
          <Input label="Nombre completo" required value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Teléfono" type="tel" value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />

          <hr className="border-slate-100" />
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            Cambiar contraseña (opcional)
          </p>
          <Input label="Nueva contraseña" type="password" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <Input label="Confirmar contraseña" type="password" value={form.password_confirmation}
            onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))} />

          <div className="flex justify-end pt-2">
            <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-4 px-1">
        <p className="text-xs text-slate-400">
          Rol: <span className="capitalize font-medium text-slate-500">{user?.role}</span>
          &nbsp;·&nbsp;
          {user?.email}
        </p>
      </div>
    </div>
  )
}
