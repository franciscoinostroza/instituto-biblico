import api from './api'
import type { User } from '@/types'

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/login', { email, password }),

  logout: () => api.post('/logout'),

  me: () => api.get<User>('/me'),

  updateProfile: (data: FormData) =>
    api.put<User>('/me', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getUsuarios: () => api.get<User[]>('/usuarios'),
}
