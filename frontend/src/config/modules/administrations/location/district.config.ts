import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const districtsListConfig = createAdministrationPage('districts', 'Districts')
export const districtsCreateConfig = administrationSubPage(districtsListConfig, 'create')
export const districtsDetailsConfig = administrationSubPage(districtsListConfig, 'details')
export const districtsEditConfig = administrationSubPage(districtsListConfig, 'edit')
