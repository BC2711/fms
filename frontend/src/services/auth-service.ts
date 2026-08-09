import axios from 'axios'

import type { User } from '@/auth/auth.types'
import { get, post } from '@/services/api-client'

interface BackendUser {
  id: number | string
  email: string
  full_name: string
  roles?: string[]
  permissions: string[]
  is_superuser?: boolean
}

interface Envelope<T> {
  success: boolean
  message: string
  data: T
}

interface LoginData {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  permissions: string[]
  user: BackendUser
}

function frontendUser(user: BackendUser): User {
  return {
    id: String(user.id),
    name: user.full_name,
    email: user.email,
    role: user.is_superuser ? 'super_admin' : (user.roles?.[0] ?? 'user'),
    permissions: user.is_superuser ? ['*'] : user.permissions,
  }
}

function authError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message
    return new Error(message ?? (error.code === 'ECONNABORTED' ? 'The login request timed out. Please try again.' : 'Unable to sign in. Check your connection and try again.'))
  }
  return error instanceof Error ? error : new Error('Unable to sign in.')
}

export async function authenticate(email: string, password: string): Promise<{ token: string; user: User }> {
  try {
    const result = await post<Envelope<LoginData>, { email: string; password: string }>('/auth/login', { email, password })
    return { token: result.data.access_token, user: frontendUser({ ...result.data.user, permissions: result.data.permissions }) }
  } catch (error) {
    throw authError(error)
  }
}

export async function currentUser(): Promise<User> {
  try {
    const result = await get<Envelope<BackendUser>>('/auth/me')
    return frontendUser(result.data)
  } catch (error) {
    throw authError(error)
  }
}
