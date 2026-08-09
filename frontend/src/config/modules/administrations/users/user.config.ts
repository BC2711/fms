import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const usersListConfig = createAdministrationPage('all-users', 'All Users')
export const usersCreateConfig = administrationSubPage(usersListConfig, 'create')
export const usersDetailsConfig = administrationSubPage(usersListConfig, 'details')
export const usersEditConfig = administrationSubPage(usersListConfig, 'edit')
