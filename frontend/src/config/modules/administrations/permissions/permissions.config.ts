import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const permissionsListConfig = createAdministrationPage('permissions', 'Permissions')
export const permissionsCreateConfig = administrationSubPage(permissionsListConfig, 'create')
export const permissionsDetailsConfig = administrationSubPage(permissionsListConfig, 'details')
export const permissionsEditConfig = administrationSubPage(permissionsListConfig, 'edit')
