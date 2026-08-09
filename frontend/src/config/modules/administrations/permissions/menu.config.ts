import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const menuPermissionsListConfig = createAdministrationPage('menu-permissions', 'Menu Permissions')
export const menuPermissionsCreateConfig = administrationSubPage(menuPermissionsListConfig, 'create')
export const menuPermissionsDetailsConfig = administrationSubPage(menuPermissionsListConfig, 'details')
export const menuPermissionsEditConfig = administrationSubPage(menuPermissionsListConfig, 'edit')
