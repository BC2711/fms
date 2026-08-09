import { describe, expect, it } from 'vitest'

import { createGeneratedResourcePage } from '@/config/generated-page-factory'
import { generatedMenuPageRegistry, getAllMenuPageConfigs, getPageConfigByRoute, pageRegistry } from '@/config/page-registry'

describe('generated missing pages', () => {
  it('creates list, create, details, and edit pages from one resource definition', () => {
    const page = createGeneratedResourcePage('/fuel-operations/fuel-products', 'Fuel Products')
    expect(page.type).toBe('list')
    expect(page.sub_pages?.map((child) => child.type)).toEqual(['create', 'details', 'edit'])
    expect(page.sub_pages?.map((child) => child.path)).toEqual([
      '/fuel-operations/fuel-products/create',
      '/fuel-operations/fuel-products/:id',
      '/fuel-operations/fuel-products/:id/edit',
    ])
  })

  it('automatically registers nested pages that existing modules had omitted', () => {
    expect(pageRegistry['station-station-groups-create']?.type).toBe('create')
    expect(pageRegistry['station-station-groups-details']?.type).toBe('details')
    expect(pageRegistry['station-station-groups-edit']?.type).toBe('edit')
    expect(pageRegistry['station-documents-details']?.type).toBe('details')
    expect(pageRegistry['station-documents-edit']?.type).toBe('edit')
    expect(pageRegistry['station-inspections-details']?.type).toBe('details')
    expect(pageRegistry['station-inspections-edit']?.type).toBe('edit')
    expect(pageRegistry['station-performance-details']?.type).toBe('details')
  })

  it('resolves newly registered configured detail and edit routes', () => {
    expect(getPageConfigByRoute('/stations/station-documents/12')?.id).toBe('station-documents-details')
    expect(getPageConfigByRoute('/stations/station-inspections/12/edit')?.id).toBe('station-inspections-edit')
  })

  it('configures every remaining menu page and its CRUD routes', () => {
    expect(Object.keys(generatedMenuPageRegistry).length).toBeGreaterThan(100)
    expect(getPageConfigByRoute('/fuel-operations/fuel-products')?.type).toBe('list')
    expect(getPageConfigByRoute('/fuel-operations/fuel-products/create')?.type).toBe('create')
    expect(getPageConfigByRoute('/fuel-operations/fuel-products/15')?.type).toBe('details')
    expect(getPageConfigByRoute('/fuel-operations/fuel-products/15/edit')?.type).toBe('edit')
    expect(getPageConfigByRoute('/accounts')).toBe(pageRegistry.accounts)
    expect(getPageConfigByRoute('/administration/roles')).toBe(pageRegistry['administration-roles'])
    expect(getAllMenuPageConfigs().length).toBeGreaterThan(100)
  })
})
