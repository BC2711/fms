import { createFuelOperationPage, type FuelOperationDefinition, type FuelOperationField } from '@/config/modules/fuel-operation/fuel-operation-page-factory'

const roots = {
  general: import.meta.env.VITE_API_ROUTE_SETTINGS_GENERAL || '/settings-general', interface: import.meta.env.VITE_API_ROUTE_SETTINGS_INTERFACE || '/settings-interface',
  operational: import.meta.env.VITE_API_ROUTE_SETTINGS_OPERATIONAL || '/settings-operational', security: import.meta.env.VITE_API_ROUTE_SETTINGS_SECURITY || '/settings-security',
  integrations: import.meta.env.VITE_API_ROUTE_SETTINGS_INTEGRATIONS || '/settings-integrations', system: import.meta.env.VITE_API_ROUTE_SETTINGS_SYSTEM || '/settings-system',
}
const field = (name: string, label: string, type: FuelOperationField['type'] = 'text', required = false): FuelOperationField => ({ name, label, type, required })
const identity = [field('name', 'Setting Name', 'text', true), field('code', 'Setting Code', 'text', true)]
const fields = {
  general: [...identity, field('value', 'Value', 'text', true), field('description', 'Description', 'textarea'), field('locale', 'Locale'), field('is_default', 'Default')],
  interface: [...identity, field('value', 'Value', 'text', true), field('platform', 'Platform'), field('user_id', 'User ID', 'number'), field('description', 'Description', 'textarea')],
  operational: [...identity, field('value', 'Value', 'text', true), field('business_area', 'Business Area'), field('effective_date', 'Effective Date', 'date'), field('description', 'Description', 'textarea')],
  security: [...identity, field('value', 'Value', 'text', true), field('security_level', 'Security Level'), field('effective_date', 'Effective Date', 'date'), field('description', 'Description', 'textarea')],
  integrations: [...identity, field('provider', 'Provider', 'text', true), field('endpoint_url', 'Endpoint URL', 'url'), field('client_id', 'Client ID'), field('credential_reference', 'Credential Reference'), field('last_sync', 'Last Sync', 'datetime')],
  system: [...identity, field('component', 'Component'), field('value', 'Value'), field('last_checked', 'Last Checked', 'datetime'), field('message', 'Message', 'textarea')],
}
type Group = keyof typeof roots
const def = (group: Group, slug: string, title: string, readOnly = false): FuelOperationDefinition => ({ slug, title, description: `Manage and review ${title.toLowerCase()}.`, fields: fields[group], routeRoot: roots[group], idPrefix: `settings-${group}`, icon: 'Circle', readOnly })
type Entry = [string, string, boolean?]
const groups: Record<Group, Entry[]> = {
  general: [['system-information', 'System Information', true], ['company-profile', 'Company Profile'], ['branding', 'Branding'], ['logo-and-favicon', 'Logo and Favicon'], ['languages', 'Languages'], ['currency', 'Currency'], ['date-and-time', 'Date and Time'], ['numbering-sequences', 'Numbering Sequences']],
  interface: [['theme-settings', 'Theme Settings'], ['layout-settings', 'Layout Settings'], ['mac-sidebar-settings', 'Mac Sidebar Settings'], ['windows-navbar-settings', 'Windows Navbar Settings'], ['default-layout', 'Default Layout'], ['sidebar-behaviour', 'Sidebar Behaviour'], ['menu-appearance', 'Menu Appearance'], ['dashboard-preferences', 'Dashboard Preferences']],
  operational: [['fuel-settings', 'Fuel Settings'], ['inventory-settings', 'Inventory Settings'], ['station-settings', 'Station Settings'], ['transaction-settings', 'Transaction Settings'], ['payment-settings', 'Payment Settings'], ['pricing-settings', 'Pricing Settings'], ['approval-workflows', 'Approval Workflows'], ['document-settings', 'Document Settings'], ['notification-settings', 'Notification Settings']],
  security: [['password-policies', 'Password Policies'], ['two-factor-authentication', 'Two-Factor Authentication'], ['session-settings', 'Session Settings'], ['login-restrictions', 'Login Restrictions'], ['api-security', 'API Security'], ['rate-limits', 'Rate Limits'], ['feature-flags', 'Feature Flags']],
  integrations: [['banking-integrations', 'Banking Integrations'], ['mobile-money-integrations', 'Mobile Money Integrations'], ['payment-gateways', 'Payment Gateways'], ['pos-integrations', 'POS Integrations'], ['fuel-pump-integrations', 'Fuel Pump Integrations'], ['gps-integrations', 'GPS Integrations'], ['email-integration', 'Email Integration'], ['sms-integration', 'SMS Integration'], ['accounting-integration', 'Accounting Integration'], ['api-clients', 'API Clients'], ['api-credentials', 'API Credentials'], ['webhooks', 'Webhooks'], ['integration-logs', 'Integration Logs', true]],
  system: [['system-health', 'System Health', true], ['service-status', 'Service Status', true], ['database-status', 'Database Status', true], ['cache-status', 'Cache Status', true], ['background-jobs', 'Background Jobs'], ['error-logs', 'Error Logs', true], ['application-logs', 'Application Logs', true], ['storage-usage', 'Storage Usage', true], ['data-imports', 'Data Imports'], ['data-exports', 'Data Exports'], ['backup-management', 'Backup Management'], ['restore-management', 'Restore Management'], ['seed-data', 'Seed Data']],
}

export const settingsConfigs = (Object.entries(groups) as [Group, Entry[]][]).flatMap(([group, entries]) => entries.map(([slug, title, readOnly]) => def(group, slug, title, readOnly))).map(createFuelOperationPage)
export const settingsPageRegistry = Object.fromEntries(settingsConfigs.map((page) => [page.id, page]))
