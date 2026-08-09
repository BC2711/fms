import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const countriesListConfig = createAdministrationPage('countries', 'Countries')
export const countriesCreateConfig = administrationSubPage(countriesListConfig, 'create')
export const countriesDetailsConfig = administrationSubPage(countriesListConfig, 'details')
export const countriesEditConfig = administrationSubPage(countriesListConfig, 'edit')
