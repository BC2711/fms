import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/auth/auth.store'
import { pageRegistry } from '@/config/page-registry'
import { GeneratedMenuPage } from '@/framework/generators/GeneratedMenuPage'
import { generateRoutes } from '@/framework/generators/RouteGenerator'

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="location">{location.pathname}|{String((location.state as { from?: string } | null)?.from ?? '')}</output>
}

describe('login redirects', () => {
  beforeEach(() => useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false }))

  it('redirects an unauthenticated configured page to login and preserves the destination', async () => {
    render(<MemoryRouter initialEntries={['/dashboard']}><Routes>{generateRoutes({ dashboard: pageRegistry.dashboard }, { includeNotFound: false })}<Route path="/login" element={<LocationProbe />} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByLabelText('location')).toHaveTextContent('/login|/dashboard'))
  })

  it('redirects an unauthenticated generated menu page to login', async () => {
    render(<MemoryRouter initialEntries={['/fuel-operations/fuel-products']}><Routes><Route path="/login" element={<LocationProbe />} /><Route path="*" element={<GeneratedMenuPage />} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByLabelText('location')).toHaveTextContent('/login|/fuel-operations/fuel-products'))
  })
})
