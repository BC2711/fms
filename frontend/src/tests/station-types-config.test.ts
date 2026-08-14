import { describe, expect, it } from 'vitest'

import { stationTypesListConfig } from '@/config/modules/stations/station-types.config'

describe('station types configuration', () => {
  it('uses explicit nested paths for row navigation actions', () => {
    const actionsColumn = stationTypesListConfig.table.columns.find((column) => column.type === 'actions')
    if (!actionsColumn || actionsColumn.type !== 'actions') throw new Error('Station Types actions column is missing')

    expect(actionsColumn.actions.find((action) => action.id === 'view')?.path).toBe('/stations/station-types/{id}')
    expect(actionsColumn.actions.find((action) => action.id === 'edit')?.path).toBe('/stations/station-types/{id}/edit')
  })
})
