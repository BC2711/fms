import { describe, expect, it } from 'vitest'

import { getAllMenuPageConfigs } from '@/config/page-registry'
import type { FormFieldConfig, PageConfig } from '@/types/configuration.types'

function flatten(pages: PageConfig[]): PageConfig[] {
  return pages.flatMap((page) => [page, ...flatten(page.sub_pages ?? [])])
}

const pages = flatten(getAllMenuPageConfigs())
const dynamicSelectNames = new Set(['station_id', 'station_type_id', 'station_group_id', 'oil_marketing_company_id', 'product_id', 'province_id', 'district_id'])

describe('frontend/backend connectivity contract', () => {
  it('configures the correct endpoint and method for every CRUD page', () => {
    for (const page of pages) {
      if (page.type === 'dashboard') continue
      const endpoints = page.api.endpoints
      if (page.type === 'list') {
        expect(endpoints.list, `${page.id} list`).toMatchObject({ method: 'GET' })
        expect(page.api.data_mapping).toMatchObject({ type: 'paginated', items: 'data.items', total: 'data.total', page: 'data.page', pageSize: 'data.pageSize' })
      }
      if (page.type === 'details') {
        expect(endpoints.item, `${page.id} item`).toMatchObject({ method: 'GET' })
        expect(endpoints.item?.path).toContain('{id}')
      }
      if (page.type === 'create') expect(endpoints.create, `${page.id} create`).toMatchObject({ method: 'POST' })
      if (page.type === 'edit') {
        expect(endpoints.item, `${page.id} edit item`).toMatchObject({ method: 'GET' })
        expect(endpoints.update, `${page.id} update`).toMatchObject({ method: 'PUT' })
        expect(endpoints.update?.path).toContain('{id}')
      }
      for (const endpoint of Object.values(endpoints)) expect(endpoint.path.startsWith('/'), `${page.id} endpoint path`).toBe(true)
    }
  })

  it('uses normalized backend paths for dedicated and generic resources', () => {
    for (const page of pages.filter((candidate) => candidate.type !== 'dashboard')) {
      for (const endpoint of Object.values(page.api.endpoints)) {
        expect(endpoint.path, `${page.id}: ${endpoint.method}`).toMatch(/^\/(?!api(?:\/|$))/)
        expect(endpoint.path, `${page.id}: ${endpoint.method}`).not.toContain(':id')
      }
    }
  })

  it('connects every empty foreign-key select to a supported lookup endpoint', () => {
    const fields = pages.flatMap((page) => page.type === 'create' || page.type === 'edit' ? page.form.fields : []) as FormFieldConfig[]
    const emptySelects = fields.filter((field) => field.type === 'select' && !field.options?.length)
    for (const field of emptySelects) expect(Boolean(field.options_endpoint) || dynamicSelectNames.has(field.name), `${field.name} lookup`).toBe(true)
  })

  it('keeps station document file upload and download fields connected', () => {
    const create = pages.find((page) => page.id === 'station-documents-create')
    const details = pages.find((page) => page.id === 'station-documents-details')
    expect(create?.type === 'create' && create.form.fields).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'file', type: 'file', required: true })]))
    expect(details?.type === 'details' && details.fields).toContain('document_name')
  })
})
