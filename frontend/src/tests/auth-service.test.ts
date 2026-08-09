import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authenticate, currentUser } from '@/services/auth-service'
import { get, post } from '@/services/api-client'

vi.mock('@/services/api-client', () => ({ get: vi.fn(), post: vi.fn() }))

describe('JWT authentication service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('maps a successful backend login into the frontend session model', async () => {
    vi.mocked(post).mockResolvedValue({ success: true, message: 'Login successful', data: { access_token: 'jwt-token', token_type: 'bearer', expires_in: 3600, permissions: ['stations.view'], user: { id: 7, email: 'admin@example.com', full_name: 'FMS Admin', roles: ['administrator'], permissions: ['stations.view'], is_superuser: false } } })
    await expect(authenticate('admin@example.com', 'Password123!')).resolves.toEqual({ token: 'jwt-token', user: { id: '7', name: 'FMS Admin', email: 'admin@example.com', role: 'administrator', permissions: ['stations.view'] } })
    expect(post).toHaveBeenCalledWith('/auth/login', { email: 'admin@example.com', password: 'Password123!' })
  })

  it('restores the current user and grants the super-admin frontend role', async () => {
    vi.mocked(get).mockResolvedValue({ success: true, message: 'Current user retrieved', data: { id: 1, email: 'root@example.com', full_name: 'Root User', roles: ['administrator'], permissions: [], is_superuser: true } })
    await expect(currentUser()).resolves.toMatchObject({ role: 'super_admin', permissions: ['*'] })
    expect(get).toHaveBeenCalledWith('/auth/me')
  })
})
