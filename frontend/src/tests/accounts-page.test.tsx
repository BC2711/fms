import { describe, expect, it } from 'vitest'

import { accountsListConfig } from '@/config/modules/accouts/accounts.config'
import { getPageConfigByRoute, pageRegistry } from '@/config/page-registry'
import { AccountsListPage } from '@/features/accounts/AccountsListPage'

describe('AccountsListPage', () => {
  it('uses the shared generated accounts configuration', () => {
    expect(AccountsListPage).toBeTypeOf('function')
    expect(pageRegistry.accounts).toBe(accountsListConfig)
    expect(getPageConfigByRoute('/accounts')).toBe(accountsListConfig)
    expect(accountsListConfig.table.columns.map((column) => column.id)).toEqual(expect.arrayContaining(['account_number', 'name', 'account_type', 'balance', 'status']))
    expect(accountsListConfig.filters?.map((filter) => filter.id)).toEqual(expect.arrayContaining(['search', 'type', 'status', 'verification']))
  })
})
