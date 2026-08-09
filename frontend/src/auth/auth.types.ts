export interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthStore extends AuthState {
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
}
