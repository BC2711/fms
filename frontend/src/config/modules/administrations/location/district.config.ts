import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const districtsListConfig = createAdministrationPage('districts', 'Districts', { field: 'province_id', label: 'Province', endpoint: '/administration/provinces' })
export const districtsCreateConfig = administrationSubPage(districtsListConfig, 'create')
export const districtsDetailsConfig = administrationSubPage(districtsListConfig, 'details')
export const districtsEditConfig = administrationSubPage(districtsListConfig, 'edit')
