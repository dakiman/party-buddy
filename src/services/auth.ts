import api from './api'
import type { User } from '@/types'

export interface AuthResponse {
  token: string
  user: User
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { username, password })
  return data
}

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    username,
    password,
  })
  return data
}

/** GET /auth/user returns the AuthResponse shape (token + user), not just User. */
export async function getMe(): Promise<AuthResponse> {
  const { data } = await api.get<AuthResponse>('/auth/user')
  return data
}
