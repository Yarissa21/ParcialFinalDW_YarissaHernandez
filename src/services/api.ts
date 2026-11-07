import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '../config'
import { authService } from './authService'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshing: Promise<string> | null = null

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    const { refreshToken, setTokens, logout } = useAuthStore.getState()
    if (!refreshToken) {
      logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      if (!refreshing) {
        refreshing = authService
          .refresh(refreshToken)
          .then((tokens) => {
            setTokens(tokens.accessToken, tokens.refreshToken)
            return tokens.accessToken
          })
          .finally(() => {
            refreshing = null
          })
      }
      const newToken = await refreshing
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      logout()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  },
)