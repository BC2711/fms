import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import type { User } from '@/auth/auth.types'
import { menuConfig } from '@/config/menu.config'
import { useLayoutPreference } from '@/hooks/useLayoutPreference'
import { MacSidebarLayout } from '@/layouts/MacSidebarLayout'
import { WindowsNavbarLayout } from '@/layouts/WindowsNavbarLayout'
import { ThemeProvider } from '@/providers/ThemeProvider'

const user: User = {
  id: '1', name: 'Test User', email: 'test@example.com', role: 'manager', permissions: ['*'],
}

describe('application layouts', () => {
  beforeEach(() => localStorage.removeItem('fms.layout'))

  it('renders and collapses the macOS sidebar shell', () => {
    render(
      <ThemeProvider><MemoryRouter>
        <MacSidebarLayout items={menuConfig} user={user} layout="mac-sidebar" onLayoutChange={() => undefined}>
          <h1>Mac content</h1>
        </MacSidebarLayout>
      </MemoryRouter></ThemeProvider>,
    )
    expect(screen.getByText('Mac content')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
  })

  it('opens the macOS mobile drawer from its responsive trigger', () => {
    render(
      <ThemeProvider><MemoryRouter>
        <MacSidebarLayout items={menuConfig} user={user} layout="mac-sidebar" onLayoutChange={() => undefined}>
          <span>Content</span>
        </MacSidebarLayout>
      </MemoryRouter></ThemeProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(screen.getByTestId('mobile-sidebar-drawer')).toHaveClass('md:hidden')
    fireEvent.click(screen.getByRole('button', { name: 'Close navigation menu' }))
  })

  it('renders the Windows navbar and opens its vertical mobile drawer', () => {
    render(
      <ThemeProvider><MemoryRouter>
        <WindowsNavbarLayout items={menuConfig} user={user} layout="windows-navbar" onLayoutChange={() => undefined}>
          <h1>Windows content</h1>
        </WindowsNavbarLayout>
      </MemoryRouter></ThemeProvider>,
    )
    expect(screen.getByText('Windows content')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(screen.getByTestId('mobile-navbar-drawer')).toHaveClass('lg:hidden')
    expect(screen.getByText('Navigation')).toBeInTheDocument()
  })

  it('persists layout changes and restores them on remount', () => {
    const first = renderHook(() => useLayoutPreference())
    expect(first.result.current[0]).toBe('mac-sidebar')
    act(() => first.result.current[1]('windows-navbar'))
    expect(localStorage.getItem('fms.layout')).toBe('windows-navbar')
    first.unmount()

    const restored = renderHook(() => useLayoutPreference())
    expect(restored.result.current[0]).toBe('windows-navbar')
  })
})
