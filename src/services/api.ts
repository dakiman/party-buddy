import axios, { type AxiosInstance } from 'axios'
import type { Router } from 'vue-router'
import type { ToastServiceMethods } from 'primevue/toastservice'
import type { useAuthStore } from '@/stores/auth'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + import.meta.env.VITE_API_PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const guestToken = localStorage.getItem('partyapp.guest_token')
  if (guestToken) {
    config.headers['X-Guest-Token'] = guestToken
  }
  return config
})

/**
 * Wires the response 401 → logout + toast + redirect-home reaction.
 * Must be called from main.ts AFTER Pinia + router + ToastService are installed.
 */
export function installAuthInterceptor(
  authStore: ReturnType<typeof useAuthStore>,
  router: Router,
  toast: ToastServiceMethods,
): void {
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // Only react if the user *had* a session — a 401 on an unauthenticated
        // request is expected (e.g. /auth/user with no token on cold load).
        if (authStore.isAuthenticated) {
          authStore.logout()
          toast.add({
            severity: 'warn',
            summary: 'Session expired',
            detail: 'Please log in again.',
            life: 3000,
          })
          router.push('/')
        }
      }
      return Promise.reject(error)
    },
  )
}

export default api
