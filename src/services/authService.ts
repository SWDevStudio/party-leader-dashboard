import { useApi } from '@/composables/useApi'

export function useAuthService() {
  const api = useApi()

  return {
    async register(email: string, password: string): Promise<{ token: string; email: string }> {
      const res = await api.post<{ token: string; email: string }>('/api/auth/register', { email, password })
      return res.data
    },

    async verify(token: string): Promise<{ token: string; email: string }> {
      const res = await api.post<{ token: string; email: string }>('/api/auth/verify', { token })
      return res.data
    },

    async login(email: string, password: string): Promise<{ token: string; email: string }> {
      const res = await api.post<{ token: string; email: string }>('/api/auth/login', { email, password })
      return res.data
    },

    async resend(email: string): Promise<void> {
      await api.post('/api/auth/resend', { email })
    },
  }
}
