import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const regionsListConfig = createAdministrationPage('station-regions', 'Station Regions', { field: 'district_id', label: 'District', endpoint: '/administration/districts' })
export const regionsCreateConfig = administrationSubPage(regionsListConfig, 'create')
export const regionsDetailsConfig = administrationSubPage(regionsListConfig, 'details')
export const regionsEditConfig = administrationSubPage(regionsListConfig, 'edit')
