import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const townsListConfig = createAdministrationPage('cities-and-towns', 'Cities and Towns')
export const townsCreateConfig = administrationSubPage(townsListConfig, 'create')
export const townsDetailsConfig = administrationSubPage(townsListConfig, 'details')
export const townsEditConfig = administrationSubPage(townsListConfig, 'edit')
