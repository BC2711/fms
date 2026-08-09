import { describe, expect, it } from 'vitest'

import { getPageConfigByRoute, pageRegistry } from '@/config/page-registry'

const resources = [
  ['all-users', 'All Users'],
  ['roles', 'Roles'],
  ['menu-permissions', 'Menu Permissions'],
  ['route-permissions', 'Route Permissions'],
  ['countries', 'Countries'],
  ['provinces', 'Provinces'],
  ['districts', 'Districts'],
  ['cities-and-towns', 'Cities and Towns'],
  ['station-regions', 'Station Regions'],
] as const

describe('administration configurations', () => {
  it.each(resources)('registers complete CRUD pages for %s', (resource, title) => {
    const path = `/administration/${resource}`
    const list = getPageConfigByRoute(path)
    expect(list).toMatchObject({ type: 'list', title, path })
    expect(list?.sub_pages?.map((page) => page.type)).toEqual(['create', 'details', 'edit'])
    expect(getPageConfigByRoute(`${path}/create`)?.type).toBe('create')
    expect(getPageConfigByRoute(`${path}/42`)?.type).toBe('details')
    expect(getPageConfigByRoute(`${path}/42/edit`)?.type).toBe('edit')
  })

  it('registers every nested configuration by id for PageGenerator', () => {
    const administrationPages = Object.values(pageRegistry).filter((page) => page.path.startsWith('/administration/'))
    expect(administrationPages).toHaveLength(resources.length * 4)
  })
})
