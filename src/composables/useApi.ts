import axios, { type AxiosInstance } from 'axios'

let _instance: AxiosInstance | null = null

export function useApi(): AxiosInstance {
  if (!_instance) {
    _instance = axios.create()

    _instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth-token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    _instance.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('auth-token')
          localStorage.removeItem('auth-email')
          window.location.hash = '#/login'
        }
        return Promise.reject(err)
      },
    )
  }
  return _instance
}
