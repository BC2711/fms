import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const routePermissionsListConfig = createAdministrationPage('route-permissions', 'Route Permissions')
export const routePermissionsCreateConfig = administrationSubPage(routePermissionsListConfig, 'create')
export const routePermissionsDetailsConfig = administrationSubPage(routePermissionsListConfig, 'details')
export const routePermissionsEditConfig = administrationSubPage(routePermissionsListConfig, 'edit')
