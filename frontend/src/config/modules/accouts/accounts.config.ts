import { createGeneratedResourcePage } from '@/config/generated-page-factory'
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { ListPageConfig } from '@/types/configuration.types'

const page = createGeneratedResourcePage('/accounts', 'All Account Holders')
page.id = 'accounts'
page.description = 'View and manage every customer account registered on the platform.'
page.permissions = { any: ['accounts.view'] }
page.statistics = [
  { id: 'total', type: 'statistic', title: 'Total Accounts', dataPath: 'statistics.total', icon: 'Users', format: 'number' },
  { id: 'active', type: 'statistic', title: 'Active Accounts', dataPath: 'statistics.active', icon: 'UserCheck', format: 'number' },
  { id: 'pending', type: 'statistic', title: 'Pending Accounts', dataPath: 'statistics.pending', icon: 'Clock', format: 'number' },
  { id: 'suspended', type: 'statistic', title: 'Suspended Accounts', dataPath: 'statistics.suspended', icon: 'UserX', format: 'number' },
]
page.filters = [
  { id: 'search', type: 'search', label: 'Search', field: 'search', query_parameter: 'search', placeholder: 'Search name, account number or email' },
  { id: 'account-type', type: 'select', label: 'Account Type', field: 'account_type', query_parameter: 'account_type', options: [
    { label: 'Corporate', value: 'corporate' }, { label: 'Oil Marketing Company', value: 'omc' },
    { label: 'Government Institution', value: 'government' }, { label: 'NGO', value: 'ngo' },
    { label: 'Individual', value: 'individual' }, { label: 'Aggregator', value: 'aggregator' },
  ] },
  { id: 'verification', type: 'select', label: 'Verification', field: 'verification_status', query_parameter: 'verification_status', options: [{ label: 'Verified', value: 'verified' }, { label: 'Pending', value: 'pending' }, { label: 'Rejected', value: 'rejected' }] },
  { id: 'status', type: 'select', label: 'Status', field: 'status', query_parameter: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Pending', value: 'pending' }, { label: 'Inactive', value: 'inactive' }, { label: 'Suspended', value: 'suspended' }] },
]
page.table.columns = [
  { id: 'account-number', type: 'text', header: 'Account', accessor: 'account_number', sortable: true, searchable: true },
  { id: 'name', type: 'text', header: 'Account Holder', accessor: 'name', sortable: true, searchable: true },
  { id: 'type', type: 'text', header: 'Type', accessor: 'account_type', sortable: true },
  { id: 'phone', type: 'text', header: 'Phone', accessor: 'phone', searchable: true },
  { id: 'email', type: 'text', header: 'Email', accessor: 'email', searchable: true },
  { id: 'balance', type: 'number', header: 'Balance', accessor: 'balance', sortable: true, format: 'currency', currency: 'ZMW' },
  { id: 'verification', type: 'badge', header: 'Verification', accessor: 'verification_status', options: { verified: 'success', pending: 'warning', rejected: 'danger' } },
  { id: 'status', type: 'badge', header: 'Status', accessor: 'status', sortable: true, options: { active: 'success', pending: 'warning', inactive: 'info', suspended: 'danger' } },
  { id: 'created', type: 'datetime', header: 'Created', accessor: 'created_at', sortable: true },
  { id: 'actions', type: 'actions', header: 'Actions', actions: [
    { id: 'view', type: 'navigate', label: 'View', icon: 'Eye', path: '/accounts/{id}' },
    { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil', path: '/accounts/{id}/edit' },
    { id: 'delete', type: 'delete', label: 'Delete', icon: 'Trash2', endpoint: '/accounts/{id}', requires_confirmation: true },
  ] },
]
const accountForm = {
  layout: { type: 'columns' as const, columns: 3 as const }, cancelPath: '/accounts', resetEnabled: true,
  fields: [
    { name: 'account_number', type: 'text' as const, label: 'Account Number', required: true },
    { name: 'name', type: 'text' as const, label: 'Account Holder Name', required: true },
    { name: 'account_type', type: 'select' as const, label: 'Account Type', required: true, options: [
      { label: 'Corporate', value: 'corporate' }, { label: 'Oil Marketing Company', value: 'omc' }, { label: 'Government Institution', value: 'government' },
      { label: 'NGO', value: 'ngo' }, { label: 'Individual', value: 'individual' }, { label: 'Aggregator', value: 'aggregator' },
    ] },
    { name: 'email', type: 'email' as const, label: 'Email' }, { name: 'phone', type: 'text' as const, label: 'Phone' },
    { name: 'currency', type: 'select' as const, label: 'Currency', default_value: 'ZMW', options: [{ label: 'Zambian Kwacha (ZMW)', value: 'ZMW' }, { label: 'US Dollar (USD)', value: 'USD' }] },
    { name: 'balance', type: 'number' as const, label: 'Opening Balance', default_value: 0 },
    { name: 'credit_limit', type: 'number' as const, label: 'Credit Limit', default_value: 0 },
    { name: 'verification_status', type: 'select' as const, label: 'Verification', default_value: 'pending', options: [{ label: 'Pending', value: 'pending' }, { label: 'Verified', value: 'verified' }, { label: 'Rejected', value: 'rejected' }] },
    { name: 'status', type: 'select' as const, label: 'Status', default_value: 'active', options: [{ label: 'Active', value: 'active' }, { label: 'Pending', value: 'pending' }, { label: 'Inactive', value: 'inactive' }, { label: 'Suspended', value: 'suspended' }] },
    { name: 'contact_person', type: 'text' as const, label: 'Contact Person' }, { name: 'address', type: 'textarea' as const, label: 'Address', rows: 3, grid: { columns: 12 } },
  ],
}
page.sub_pages?.forEach((subPage) => {
  subPage.id = `accounts-${subPage.type}`; subPage.parentId = 'accounts'
  if (subPage.type === 'create' || subPage.type === 'edit') {
    subPage.form = { ...accountForm, submitLabel: subPage.type === 'create' ? 'Create Account' : 'Save Account' }
    subPage.permissions = { any: [`accounts.${subPage.type}`] }
  }
  if (subPage.type === 'details') {
    subPage.permissions = { any: ['accounts.view'] }
    subPage.fields = ['account_number', 'name', 'account_type', 'email', 'phone', 'balance', 'credit_limit', 'available_credit', 'verification_status', 'status', 'created_at']
    subPage.sections = [
      { id: 'identity', title: 'Account Information', fields: [
        { key: 'account_number', label: 'Account Number', type: 'text', copyable: true }, { key: 'name', label: 'Account Holder', type: 'text' },
        { key: 'account_type', label: 'Account Type', type: 'badge' }, { key: 'verification_status', label: 'Verification', type: 'badge' }, { key: 'status', label: 'Status', type: 'badge' },
      ] },
      { id: 'contact', title: 'Contact', fields: [{ key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'text' }, { key: 'contact_person', label: 'Contact Person', type: 'text' }, { key: 'address', label: 'Address', type: 'text' }] },
      { id: 'finance', title: 'Financial Position', fields: [{ key: 'balance', label: 'Balance', type: 'number' }, { key: 'credit_limit', label: 'Credit Limit', type: 'number' }, { key: 'available_credit', label: 'Available Credit', type: 'number' }, { key: 'currency', label: 'Currency', type: 'text' }] },
    ]
  }
})

export const accountsListConfig = validateConfig('accounts list page', pageConfigSchema, page) as ListPageConfig
