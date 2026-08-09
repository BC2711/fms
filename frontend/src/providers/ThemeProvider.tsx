import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

export type Theme = 'light' | 'dark' | 'system'
interface ThemeContextValue { theme: Theme; setTheme: (theme: Theme) => void; isDark: boolean }
const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'fms.theme'

function storedTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(storedTheme)
  const [systemDark, setSystemDark] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches))
  const isDark = theme === 'dark' || (theme === 'system' && systemDark)

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const change = (event: MediaQueryListEvent | MediaQueryList) => setSystemDark(event.matches)
    if (media) change(media)
    media?.addEventListener?.('change', change)
    return () => media?.removeEventListener?.('change', change)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, theme)
  }, [isDark, theme])

  const value = useMemo(() => ({ theme, setTheme: setThemeState, isDark }), [isDark, theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider.')
  return context
}
