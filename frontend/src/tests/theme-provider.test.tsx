import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeSwitcher } from '@/layouts/components/ThemeSwitcher'
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider'

function Probe() {
  const { theme, isDark } = useTheme()
  return <><span data-testid="theme">{theme}</span><span data-testid="dark">{String(isDark)}</span><ThemeSwitcher /></>
}

describe('ThemeProvider', () => {
  let systemDark = false
  let listener: ((event: MediaQueryListEvent) => void) | undefined
  beforeEach(() => {
    localStorage.clear(); document.documentElement.classList.remove('dark'); systemDark = false
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: systemDark, media: '(prefers-color-scheme: dark)', onchange: null, addEventListener: (_event: string, callback: (event: MediaQueryListEvent) => void) => { listener = callback }, removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() })))
  })

  it('cycles themes, applies the dark class, and persists preference', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    fireEvent.click(screen.getByRole('button', { name: /Theme: system/ }))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    fireEvent.click(screen.getByRole('button', { name: /Theme: light/ }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('fms.theme')).toBe('dark')
  })

  it('reacts to system preference changes in system mode', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => listener?.({ matches: true } as MediaQueryListEvent))
    expect(screen.getByTestId('dark')).toHaveTextContent('true')
    expect(document.documentElement).toHaveClass('dark')
  })
})
