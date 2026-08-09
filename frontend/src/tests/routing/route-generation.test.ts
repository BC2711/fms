import { describe, expect, it } from 'vitest'

import { findDuplicateRoutes, interpolateRoute } from '@/app/router/route-utils'
import { pageRegistry } from '@/config/page-registry'
import { generateRoutes } from '@/framework/generators/RouteGenerator'
import type { PageConfig } from '@/types/configuration.types'

describe('route generation', () => {
  it('creates root and nested module paths', () => {
    const paths = generateRoutes(pageRegistry).map((route) => (route.props as { path: string }).path)
    expect(paths).toEqual(expect.arrayContaining(['/banks', '/banks/create', '/banks/:id', '/banks/:id/edit', '/test-items', '/test-items/create']))
  })

  it('separates standalone auth routes from application-shell routes', () => {
    const standalonePaths = generateRoutes(pageRegistry, { layout: 'standalone', includeNotFound: false }).map((route) => (route.props as { path: string }).path)
    const applicationPaths = generateRoutes(pageRegistry, { layout: 'application' }).map((route) => (route.props as { path: string }).path)

    expect(standalonePaths).toEqual(['/login', '/register', '/forgot-password'])
    expect(applicationPaths).toContain('/dashboard')
    expect(applicationPaths).not.toContain('/login')
  })

  it('detects duplicate routes', () => {
    const duplicate = [{ id: 'a', type: 'dashboard', title: 'A', path: '/same', widgets: [] }, { id: 'b', type: 'dashboard', title: 'B', path: '/same', widgets: [] }] as PageConfig[]
    expect(findDuplicateRoutes(duplicate)).toEqual(['/same'])
  })

  it('interpolates colon and brace dynamic parameters', () => {
    expect(interpolateRoute('/banks/:id/edit', { id: 7 })).toBe('/banks/7/edit')
    expect(interpolateRoute('/banks/{id}', { id: 'A B' })).toBe('/banks/A%20B')
  })
})
