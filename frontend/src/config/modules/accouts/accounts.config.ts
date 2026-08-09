import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { ListPageConfig } from '@/types/configuration.types'

const raw = {
  id: 'accounts',
  title: 'All Account Holders',
  page_title: 'All Account Holders',
  description: 'View and manage every customer account registered on the platform.',
  type: 'list',
  page_type: 'list',
  path: '/accounts',
  route: '/accounts',
  api: {
    baseUrl: '/api',
    data_mapping: {
      type: 'paginated',
      items: 'data.items',
      total: 'data.total',
      page: 'data.page',
      pageSize: 'data.pageSize'
    },
    endpoints: {
      list: {
        path: '/accounts',
        method: 'GET'
      }
    }
  },
  statistics: [
    {
      id: 'total-accounts',
      type: 'statistic',
      title: 'Total Accounts',
      dataPath: 'total',
      icon: 'Users',
      format: 'number'
    },
    {
      id: 'active-accounts',
      type: 'statistic',
      title: 'Active Accounts',
      dataPath: 'active',
      icon: 'Users',
      format: 'number'
    },
    {
      id: 'inactive-accounts',
      type: 'statistic',
      title: 'Inactive Accounts',
      dataPath: 'inactive',
      icon: 'Users',
      format: 'number'
    },
    {
      id: 'suspended-accounts',
      type: 'statistic',
      title: 'Suspended Accounts',
      dataPath: 'suspended',
      icon: 'Users',
      format: 'number'
    }
  ],
  filters: [
    { id: 'search', type: 'search', label: 'Search', field: 'search', query_parameter: 'search', placeholder: 'Search name, account number or email' },
    { id: 'type', type: 'select', label: 'Account Type', field: 'type', query_parameter: 'type', options: [{ label: 'Corporate', value: 'corporate' }, { label: 'Oil Marketing Company', value: 'omc' }, { label: 'Government', value: 'government' }, { label: 'NGO', value: 'ngo' }, { label: 'Individual', value: 'individual' }, { label: 'Aggregator', value: 'aggregator' }] },
    { id: 'status', type: 'select', label: 'Status', field: 'status', query_parameter: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Suspended', value: 'suspended' }] },
    { id: 'verification', type: 'select', label: 'Verification', field: 'verification', query_parameter: 'verification', options: [{ label: 'Verified', value: 'verified' }, { label: 'Pending', value: 'pending' }] },
  ],
  table: {
    rowKey: 'id',
    stickyHeader: true,
    striped: true,
    pagination: {
      enabled: true,
      pageSize: 10,
      pageSizeOptions: [10, 20, 50]
    },
    sorting: {
      enabled: true,
      defaultColumn: 'name',
      defaultDirection: 'asc'
    },
    columns: [
      {
        id: 'account_number',
        type: 'text',
        header: 'Account',
        accessor: 'account_number',
        sortable: true, searchable: true
      },
      {
        id: 'name',
        type: 'text',
        header: 'Account Holder',
        accessor: 'name',
        sortable: true, searchable: true
      },
      {
        id: 'account_type',
        type: 'text',
        header: 'Type',
        accessor: 'account_type', sortable: true
      },
      {
        id: 'contact-person',
        type: 'text',
        header: 'Contact Person',
        accessor: 'contact_person',
        searchable: true
      },
      {
        id: 'phone',
        type: 'number',
        header: 'Phone',
        accessor: 'phone',
        searchable: true
      },
      {
        id: 'email',
        type: 'text',
        header: 'Contact',
        accessor: 'email',
        searchable: true
      },
      {
        id: 'province',
        type: 'text',
        header: 'Province',
        accessor: 'province',
        searchable: true
      },
      {
        id: 'district',
        type: 'text',
        header: 'District',
        accessor: 'district',
        searchable: true
      },
      {
        id: 'organization_name',
        type: 'text',
        header: 'Organization',
        accessor: 'organization_name',
        searchable: true
      },
      {
        id: 'balance',
        type: 'number',
        header: 'Balance (ZMW)',
        accessor: 'balance',
        sortable: true, format: 'currency', currency: 'ZMW'
      },
      {
        id: 'credit_limit',
        type: 'number',
        header: 'Credit Limit',
        accessor: 'credit_limit',
        sortable: true, format: 'currency', currency: 'ZMW'
      },
      {
        id: 'available_credit',
        type: 'number',
        header: 'Available Credit',
        accessor: 'available_credit',
        sortable: true, format: 'currency', currency: 'ZMW'
      },
      {
        id: 'currency',
        type: 'text',
        header: 'Currency',
        accessor: 'currency',
        searchable: true
      },
      {
        id: 'vehicle_count',
        type: 'text',
        header: 'Vehicle Count',
        accessor: 'vehicle_count',
        searchable: true
      },
      {
        id: 'driver_count',
        type: 'text',
        header: 'Driver Count',
        accessor: 'driver_count',
        searchable: true
      },
      {
        id: 'cards_count',
        type: 'text',
        header: 'Cards Count',
        accessor: 'cards_count',
        searchable: true
      },
      {
        id: 'verification_status',
        type: 'badge', header: 'Verification', accessor: 'verification_status', options: { verified: 'success', pending: 'warning' }
      },
      {
        id: 'status',
        type: 'badge',
        header: 'Status',
        accessor: 'status',
        sortable: true,
        options: { active: 'success', suspended: 'danger' }
      },
      {
        id: 'kyc_status',
        type: 'badge',
        header: 'Compliance verification status',
        accessor: 'status',
        sortable: true,
        options: { active: 'success', suspended: 'danger' }
      },
      {
        id: 'created_at',
        type: 'text',
        header: 'Created At',
        accessor: 'created_at',
        sortable: true
      },
      {
        id: 'updated_at',
        type: 'text',
        header: 'Updated At',
        accessor: 'updated_at',
        sortable: true
      },
    ]
  },
} satisfies ListPageConfig
export const accountsListConfig = validateConfig('accounts list page', pageConfigSchema, raw) as ListPageConfig

