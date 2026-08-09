import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/auth/auth.store'
import type { User } from '@/auth/auth.types'
import { NavigationGenerator } from '@/framework/generators/NavigationGenerator'
import type { MenuConfig } from '@/types/configuration.types'

const user: User = {
  id: '1', name: 'Reader', email: 'reader@example.com', role: 'reader', permissions: ['banks.read'],
}

const menuItems: MenuConfig[] = [
  { id: 'main-group', label: 'Main', type: 'group' },
  { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', badge: 2 },
  { id: 'divider', label: 'Divider', type: 'divider' },
  {
    id: 'management', label: 'Management', icon: 'Settings', children: [
      { id: 'banks', label: 'Banks', route: '/management/banks', permissions: { all: ['banks.read'] } },
      { id: 'secret', label: 'Secret', route: '/management/secret', permissions: { all: ['secret.read'] } },
    ],
  },
  { id: 'hidden', label: 'Hidden item', route: '/hidden', is_visible: false },
  { id: 'disabled', label: 'Disabled item', route: '/disabled', disabled: true },
  { id: 'docs', label: 'Documentation', route: 'https://example.com/docs', external: true },
]

function renderNavigation(collapsed = false, layout: 'sidebar' | 'navbar' = 'sidebar') {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <NavigationGenerator menuItems={menuItems} collapsed={collapsed} layout={layout} />
    </MemoryRouter>,
  )
}

describe('NavigationGenerator', () => {
  beforeEach(() => useAuthStore.setState({ user, token: 'token', isAuthenticated: true, isLoading: false }))

  it('renders configured types, filters visibility and permissions, and marks the active route', () => {
    renderNavigation()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()
    expect(screen.queryByText('Hidden item')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dashboard/i })).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('button', { name: /management/i }))
    expect(screen.getByText('Banks')).toBeInTheDocument()
    expect(screen.queryByText('Secret')).not.toBeInTheDocument()
  })

  it('supports disabled items and safe external links', () => {
    renderNavigation()
    expect(screen.getByRole('button', { name: 'Disabled item' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('target', '_blank')
  })

  it('opens collapsed child menus on hover and closes them with Escape', () => {
    renderNavigation(true)
    const parentButton = screen.getByRole('button', { name: 'Management' })
    expect(parentButton).toHaveAttribute('aria-expanded', 'false')
    fireEvent.mouseEnter(parentButton.parentElement as HTMLElement)
    expect(parentButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Banks')).toBeInTheDocument()
    fireEvent.keyDown(parentButton.parentElement as HTMLElement, { key: 'Escape' })
    expect(parentButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('uses focusable native controls for keyboard activation', () => {
    renderNavigation()
    expect(screen.getByRole('button', { name: /dashboard/i }).tabIndex).toBe(0)
    expect(screen.getByRole('button', { name: /management/i })).toHaveAttribute('aria-expanded')
  })
})
