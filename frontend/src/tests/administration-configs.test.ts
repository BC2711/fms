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
    for (const [resource] of resources) {
      const rootId = `administration-${resource}`
      expect(pageRegistry[rootId]).toBeDefined()
      for (const type of ['create', 'details', 'edit']) expect(pageRegistry[`${rootId}-${type}`]).toBeDefined()
    }
  })

  it.each([
    ['provinces', 'country_id', '/administration/countries'],
    ['districts', 'province_id', '/administration/provinces'],
    ['cities-and-towns', 'district_id', '/administration/districts'],
    ['station-regions', 'district_id', '/administration/districts'],
  ] as const)('adds the parent selector to %s forms', (resource, fieldName, endpoint) => {
    const page = getPageConfigByRoute(`/administration/${resource}`)
    if (!page || page.type !== 'list') throw new Error('Missing list page')
    for (const type of ['create', 'edit']) {
      const subPage = page?.sub_pages?.find((candidate) => candidate.type === type)
      if (!subPage || (subPage.type !== 'create' && subPage.type !== 'edit')) throw new Error(`Missing ${type} page`)
      const parentFields = subPage.form.fields.filter((field) => field.name === fieldName)
      expect(parentFields).toHaveLength(1)
      expect(parentFields[0]).toMatchObject({ required: true, options_endpoint: endpoint })
    }
    const parentColumns = page.table.columns.filter((column) => column.id === fieldName)
    expect(parentColumns).toHaveLength(1)
    expect(parentColumns[0]).toMatchObject({ accessor: `${fieldName.replace(/_id$/, '')}.name` })
  })
})
