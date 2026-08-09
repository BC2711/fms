import { create } from 'zustand'

import type { AuthStore } from '@/auth/auth.types'
import { getToken, removeRefreshToken, removeToken, setToken } from '@/services/token-manager'

const storedToken = getToken()

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: storedToken,
  isAuthenticated: false,
  isLoading: Boolean(storedToken),
  login: (token, user) => {
    setToken(token)
    set({ token, user, isAuthenticated: true, isLoading: false })
  },
  logout: () => {
    removeToken()
    removeRefreshToken()
    set({ token: null, user: null, isAuthenticated: false, isLoading: false })
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
