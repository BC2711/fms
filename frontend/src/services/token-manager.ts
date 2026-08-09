export interface TokenStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const ACCESS_TOKEN_KEY = 'fms.access_token'
const REFRESH_TOKEN_KEY = 'fms.refresh_token'

const memoryStorage = new Map<string, string>()
const fallbackStorage: TokenStorage = {
  getItem: (key) => memoryStorage.get(key) ?? null,
  setItem: (key, value) => { memoryStorage.set(key, value) },
  removeItem: (key) => { memoryStorage.delete(key) },
}

let storage: TokenStorage = typeof localStorage === 'undefined' ? fallbackStorage : localStorage

export function configureTokenStorage(nextStorage: TokenStorage): void {
  storage = nextStorage
}

export function getToken(): string | null {
  return storage.getItem(ACCESS_TOKEN_KEY)
}

export function setToken(token: string): void {
  storage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeToken(): void {
  storage.removeItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return storage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  storage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken(): void {
  storage.removeItem(REFRESH_TOKEN_KEY)
}
