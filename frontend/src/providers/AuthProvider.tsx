import { useEffect, type PropsWithChildren } from 'react'

import { useAuthStore } from '@/auth/auth.store'
import { currentUser } from '@/services/auth-service'

export function AuthProvider({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    let active = true
    if (!token) {
      useAuthStore.getState().setLoading(false)
      return
    }
    useAuthStore.getState().setLoading(true)
    void currentUser()
      .then((user) => { if (active) useAuthStore.getState().login(token, user) })
      .catch(() => { if (active) useAuthStore.getState().logout() })
    return () => { active = false }
  }, [token])

  return children
}
