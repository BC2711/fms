import { describe, expect, it } from 'vitest'

import { filterConfigSchema, formConfigSchema, pageConfigSchema, tableConfigSchema, validateConfig } from '@/framework/schemas'
import { ConfigurationError } from '@/utils/errors'

const table = { rowKey: 'id', columns: [{ id: 'name', type: 'text', header: 'Name', accessor: 'name' }] }
const form = { fields: [{ name: 'name', type: 'text', label: 'Name', required: true }] }
const page = { id: 'items', type: 'list', title: 'Items', path: '/items', api: { endpoints: { list: { path: '/items', method: 'GET' } } }, table }

describe('strict configuration schemas', () => {
  it('accepts valid page, table, form, and filter configurations', () => {
    expect(validateConfig('page', pageConfigSchema, page)).toMatchObject({ id: 'items' })
    expect(validateConfig('table', tableConfigSchema, table)).toEqual(table)
    expect(validateConfig('form', formConfigSchema, form)).toEqual(form)
    expect(validateConfig('filter', filterConfigSchema, { id: 'search', type: 'search', label: 'Search', field: 'q' })).toMatchObject({ type: 'search' })
  })

  it('accepts file fields and selects whose options are populated dynamically', () => {
    const dynamicForm = { fields: [
      { name: 'station_id', type: 'select', label: 'Station', options: [] },
      { name: 'document', type: 'file', label: 'Document', required: true },
    ] }

    expect(validateConfig('dynamic form', formConfigSchema, dynamicForm)).toEqual(dynamicForm)
  })

  it('accepts row and configured column form layouts', () => {
    expect(validateConfig('row form', formConfigSchema, { ...form, layout: { type: 'rows' } })).toMatchObject({ layout: { type: 'rows' } })
    expect(validateConfig('column form', formConfigSchema, { ...form, layout: { type: 'columns', columns: 3 } })).toMatchObject({ layout: { type: 'columns', columns: 3 } })
  })

  it.each([
    ['missing required fields', pageConfigSchema, { type: 'list' }],
    ['wrong types', tableConfigSchema, { ...table, rowKey: 42 }],
    ['unknown properties', formConfigSchema, { ...form, unsupported: true }],
    ['invalid filter', filterConfigSchema, { id: 'status', type: 'select', label: 'Status', field: 'status', options: 'all' }],
  ])('throws ConfigurationError for %s', (_label, schema, value) => {
    expect(() => validateConfig('invalid config', schema, value)).toThrow(ConfigurationError)
  })
})
