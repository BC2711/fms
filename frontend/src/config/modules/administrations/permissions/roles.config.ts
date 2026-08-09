import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const rolesListConfig = createAdministrationPage('roles', 'Roles')
export const rolesCreateConfig = administrationSubPage(rolesListConfig, 'create')
export const rolesDetailsConfig = administrationSubPage(rolesListConfig, 'details')
export const rolesEditConfig = administrationSubPage(rolesListConfig, 'edit')
