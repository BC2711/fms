import { describe, expect, it } from 'vitest'

import { API_BASE_URL, resolveBackendBaseUrl, resolveBackendPath } from '@/config/backend-env'

describe('backend environment configuration', () => {
  it('uses the environment API base URL for module defaults', () => {
    expect(resolveBackendBaseUrl('/api')).toBe(API_BASE_URL)
    expect(resolveBackendBaseUrl(undefined)).toBe(API_BASE_URL)
  })

  it('preserves endpoint suffixes and route parameters', () => {
    expect(resolveBackendPath('/accounts/aggregators/{id}/vehicles')).toBe('/accounts/aggregators/{id}/vehicles')
    expect(resolveBackendPath('/stations?group_id={id}')).toBe('/stations?group_id={id}')
  })

  it('does not alter external URLs', () => {
    expect(resolveBackendPath('https://api.example.com/items')).toBe('https://api.example.com/items')
  })
})
