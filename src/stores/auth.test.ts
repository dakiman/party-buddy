import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const apiGet = vi.mocked(api.get)

// The store reads localStorage at setup time; vitest runs in a node
// environment, so stub a minimal implementation.
const storage = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
  removeItem: (k: string) => void storage.delete(k),
})

beforeEach(() => {
  storage.clear()
  apiGet.mockReset()
  setActivePinia(createPinia())
})

describe('auth store ready gate', () => {
  it('resolves immediately when no token is stored', async () => {
    const auth = useAuthStore()
    await auth.ready
    expect(auth.initialized).toBe(true)
    expect(auth.user).toBeNull()
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('resolves after GET /auth/user succeeds, with user populated', async () => {
    storage.set('token', 'stored-jwt')
    apiGet.mockResolvedValue({
      data: { token: 'stored-jwt', user: { id: 1, email: 'c@t.local', username: 'carol' } },
    })
    const auth = useAuthStore()
    expect(auth.initialized).toBe(false)
    await auth.ready
    expect(auth.initialized).toBe(true)
    expect(auth.user?.username).toBe('carol')
  })

  it('resolves (never rejects) when GET /auth/user 401s, and logs out', async () => {
    storage.set('token', 'expired-jwt')
    apiGet.mockRejectedValue({ response: { status: 401 } })
    const auth = useAuthStore()
    await auth.ready
    expect(auth.initialized).toBe(true)
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
  })
})
