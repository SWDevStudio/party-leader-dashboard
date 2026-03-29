import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth-token'))
  const email = ref<string | null>(localStorage.getItem('auth-email'))

  const isAuthenticated = computed(() => token.value !== null)

  const service = useAuthService()

  async function login(userEmail: string, password: string): Promise<void> {
    const res = await service.login(userEmail, password)
    setCredentials(res.token, res.email)
  }

  async function register(userEmail: string, password: string): Promise<void> {
    const res = await service.register(userEmail, password)
    setCredentials(res.token, res.email)
  }

  async function verifyEmail(verifyToken: string): Promise<void> {
    const res = await service.verify(verifyToken)
    setCredentials(res.token, res.email)
  }

  async function resendVerification(userEmail: string): Promise<void> {
    await service.resend(userEmail)
  }

  function setCredentials(newToken: string, newEmail: string): void {
    token.value = newToken
    email.value = newEmail
    localStorage.setItem('auth-token', newToken)
    localStorage.setItem('auth-email', newEmail)
  }

  function logout(): void {
    token.value = null
    email.value = null
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-email')
  }

  return { token, email, isAuthenticated, login, register, logout, verifyEmail, resendVerification }
})
