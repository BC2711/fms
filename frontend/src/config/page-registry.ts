import { dashboardConfig } from '@/config/pages/dashboard.config'
import { testItemsCreateConfig, testItemsDetailsConfig, testItemsEditConfig, testItemsListConfig } from '@/config/modules/test-items.config'
import type { ListPageConfig, PageConfig } from '@/types/configuration.types'
import { banksCreateConfig, banksDetailsConfig, banksEditConfig, banksListConfig } from '@/config/modules/banks.config'
import { forgetPasswordConfig } from '@/config/modules/auth/forgetPassword.config'
import { loginConfig } from '@/config/modules/auth/login.config'
import { registerConfig } from '@/config/modules/auth/register.config'

import { accountsListConfig } from '@/config/modules/accouts/accounts.config'
import { individualsCreateConfig, individualsDetailsConfig, individualsEditConfig, individualsListConfig } from './modules/accouts/individuals.config'
import { corporateCompaniesCreateConfig, corporateCompaniesDetailsConfig, corporateCompaniesEditConfig, corporateCompaniesListConfig } from './modules/accouts/corporates.config'
import { ngosCreateConfig, ngosDetailsConfig, ngosEditConfig, ngosListConfig } from './modules/accouts/ngos.config'
import { oilMarketingCompaniesCreateConfig, oilMarketingCompaniesDetailsConfig, oilMarketingCompaniesEditConfig, oilMarketingCompaniesListConfig } from './modules/accouts/omc.config'
import { governmentInstitutionsCreateConfig, governmentInstitutionsDetailsConfig, governmentInstitutionsEditConfig } from './modules/accouts/government.config'
import { governmentInstitutionsListConfig } from './modules/accouts/government.config'
import { aggregatorsCreateConfig, aggregatorsDetailsConfig, aggregatorsEditConfig, aggregatorsListConfig } from './modules/accouts/aggregators.config'
import { stationPerformanceListConfig } from './modules/stations/station-performance.config'
import { stationDocumentsListConfig, stationDocumentsUploadConfig } from './modules/stations/station-documents.config'
import { stationInspectionsListConfig, stationInspectionsCreateConfig } from './modules/stations/station-inspections.config'
import { stationPriceBoardsListConfig, stationsPriceBoardsCreateConfig } from './modules/stations/station-price-boards.config'
import { stationsCreateConfig, stationsDetailsConfig, stationsEditConfig, stationsListConfig } from './modules/stations/stations.config'
import { stationTypesCreateConfig, stationTypesDetailsConfig, stationTypesEditConfig, stationTypesListConfig } from './modules/stations/station-types.config'
import { stationGroupsListConfig } from './modules/stations/station-groups.config'
import { usersListConfig } from '@/config/modules/administrations/users/user.config'
import { rolesListConfig } from '@/config/modules/administrations/permissions/roles.config'
import { permissionsListConfig } from '@/config/modules/administrations/permissions/permissions.config'
import { menuPermissionsListConfig } from '@/config/modules/administrations/permissions/menu.config'
import { routePermissionsListConfig } from '@/config/modules/administrations/permissions/route-permissions.config'
import { countriesListConfig } from '@/config/modules/administrations/location/countries.config'
import { provincesListConfig } from '@/config/modules/administrations/location/province.config'
import { districtsListConfig } from '@/config/modules/administrations/location/district.config'
import { townsListConfig } from '@/config/modules/administrations/location/town.config'
import { regionsListConfig } from '@/config/modules/administrations/location/region.config'
import { fuelOperationPageRegistry } from '@/config/modules/fuel-operation/fuel-operations.config'
import { requestOrderPageRegistry } from '@/config/modules/request-and-orders/request-orders.config'
import { logisticsPageRegistry } from '@/config/modules/logistics/logistics.config'
import { fleetPageRegistry } from '@/config/modules/fleet/fleet.config'
import { cardsPosPageRegistry } from '@/config/modules/cards-and-pos/cards-pos.config'
import { financePageRegistry } from '@/config/modules/finance/finance.config'
import { compliancePageRegistry } from '@/config/modules/compliance/compliance.config'
import { reportsPageRegistry } from '@/config/modules/reports/reports.config'
import { myAccountPageRegistry } from '@/config/modules/my-account/my-account.config'
import { settingsPageRegistry } from '@/config/modules/settings/settings.config'

export const pageRegistry: Record<string, PageConfig> = {
  ...fuelOperationPageRegistry,
  ...requestOrderPageRegistry,
  ...logisticsPageRegistry,
  ...fleetPageRegistry,
  ...cardsPosPageRegistry,
  ...financePageRegistry,
  ...compliancePageRegistry,
  ...reportsPageRegistry,
  ...myAccountPageRegistry,
  ...settingsPageRegistry,
  login: loginConfig,
  register: registerConfig,
  'forgot-password': forgetPasswordConfig,

  dashboard: dashboardConfig,

  accounts: accountsListConfig,

  'oil-marketing-companies': oilMarketingCompaniesListConfig,
  'oil-marketing-companies-create': oilMarketingCompaniesCreateConfig,
  'oil-marketing-companies-details': oilMarketingCompaniesDetailsConfig,
  'oil-marketing-companies-edit': oilMarketingCompaniesEditConfig,

  'corporate-companies': corporateCompaniesListConfig,
  'corporate-companies-create': corporateCompaniesCreateConfig,
  'corporate-companies-details': corporateCompaniesDetailsConfig,
  'corporate-companies-edit': corporateCompaniesEditConfig,

  'government-institutions': governmentInstitutionsListConfig,
  'government-institutions-create': governmentInstitutionsCreateConfig,
  'government-institutions-details': governmentInstitutionsDetailsConfig,
  'government-institutions-edit': governmentInstitutionsEditConfig,

  'ngos': ngosListConfig,
  'ngos-create': ngosCreateConfig,
  'ngos-details': ngosDetailsConfig,
  'ngos-edit': ngosEditConfig,

  'individuals': individualsListConfig,
  'individuals-create': individualsCreateConfig,
  'individuals-details': individualsDetailsConfig,
  'individuals-edit': individualsEditConfig,

  'aggregators': aggregatorsListConfig,
  'aggregators-create': aggregatorsCreateConfig,
  'aggregators-details': aggregatorsDetailsConfig,
  'aggregators-edit': aggregatorsEditConfig,

  // STATIONS MODULE
  'station-groups': stationGroupsListConfig,

  'stations': stationsListConfig,
  'stations-create': stationsCreateConfig,
  'stations-details': stationsDetailsConfig,
  'stations-edit': stationsEditConfig,

  'station-types': stationTypesListConfig,
  'station-types-create': stationTypesCreateConfig,
  'station-types-details': stationTypesDetailsConfig,
  'station-types-edit': stationTypesEditConfig,

  'station-price-boards': stationPriceBoardsListConfig,
  'station-price-boards-create': stationsPriceBoardsCreateConfig,

  'station-inspections': stationInspectionsListConfig,
  'station-inspections-create': stationInspectionsCreateConfig,

  'station-documents': stationDocumentsListConfig,
  'station-documents-create': stationDocumentsUploadConfig,

  'station-performance': stationPerformanceListConfig,

  // ADMINISTRATION MODULE
  'administration-all-users': usersListConfig,
  'administration-roles': rolesListConfig,
  'administration-permissions': permissionsListConfig,
  'administration-menu-permissions': menuPermissionsListConfig,
  'administration-route-permissions': routePermissionsListConfig,
  'administration-countries': countriesListConfig,
  'administration-provinces': provincesListConfig,
  'administration-districts': districtsListConfig,
  'administration-cities-and-towns': townsListConfig,
  'administration-station-regions': regionsListConfig,

  'test-items': testItemsListConfig,
  'test-items-create': testItemsCreateConfig,
  'test-items-details': testItemsDetailsConfig,
  'test-items-edit': testItemsEditConfig,
  banks: banksListConfig,
  'banks-create': banksCreateConfig,
  'banks-details': banksDetailsConfig,
  'banks-edit': banksEditConfig,
}

function visitPages(config: PageConfig, visitor: (page: PageConfig) => void): void {
  visitor(config)
  config.sub_pages?.forEach((page) => visitPages(page, visitor))
}

const configuredPaths = new Set<string>()
Object.values(pageRegistry).filter((config) => !config.parentId).forEach((config) => {
  visitPages(config, (page) => {
    configuredPaths.add(page.path)
    pageRegistry[page.id] ??= page
  })
})

export const generatedMenuPageRegistry: Record<string, PageConfig> = {}

export function getPageConfig(key: string): PageConfig | undefined { return pageRegistry[key] ?? generatedMenuPageRegistry[key] }
export function getAllPageConfigs(): PageConfig[] { return Object.values(pageRegistry).filter((config) => !config.parentId) }
export function getAllMenuPageConfigs(): PageConfig[] { return [...getAllPageConfigs(), ...Object.values(generatedMenuPageRegistry).filter((config) => !config.parentId)] }
export function registerPageConfig(config: PageConfig): void { pageRegistry[config.id] = config }

function routePattern(config: PageConfig): string { return config.path }
function matchesRoute(pattern: string, pathname: string): boolean {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:[A-Za-z0-9_]+/g, '[^/]+')
  return new RegExp(`^${escaped}/?$`).test(pathname)
}

export function getPageConfigByRoute(pathname: string): PageConfig | undefined {
  return [...Object.values(pageRegistry), ...Object.values(generatedMenuPageRegistry)]
    .sort((left, right) => (routePattern(left).includes(':') ? 1 : 0) - (routePattern(right).includes(':') ? 1 : 0) || routePattern(right).length - routePattern(left).length)
    .find((config) => matchesRoute(routePattern(config), pathname))
}

export function getGeneratedRootPageByRoute(pathname: string): ListPageConfig | undefined {
  return Object.values(generatedMenuPageRegistry)
    .filter((config): config is ListPageConfig => config.type === 'list' && !config.parentId && (pathname === config.path || pathname.startsWith(`${config.path}/`)))
    .sort((left, right) => right.path.length - left.path.length)[0]
}
