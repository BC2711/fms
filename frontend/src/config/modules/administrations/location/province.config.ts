import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const provincesListConfig = createAdministrationPage('provinces', 'Provinces', { field: 'country_id', label: 'Country', endpoint: '/administration/countries' })
export const provincesCreateConfig = administrationSubPage(provincesListConfig, 'create')
export const provincesDetailsConfig = administrationSubPage(provincesListConfig, 'details')
export const provincesEditConfig = administrationSubPage(provincesListConfig, 'edit')
