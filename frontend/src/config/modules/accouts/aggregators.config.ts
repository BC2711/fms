import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'

import type {
    ApiConfig,
    FormConfig,
    ListPageConfig,
    PageConfig,
} from '@/types/configuration.types'

const api: ApiConfig = {
    baseUrl: '/api',

    data_mapping: {
        type: 'paginated',
        items: 'data.items',
        total: 'data.total',
        page: 'data.page',
        pageSize: 'data.pageSize',
    },

    endpoints: {
        list: { path: '/accounts/aggregators', method: 'GET' },
        item: {
            path: '/accounts/aggregators/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/accounts/aggregators',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/accounts/aggregators/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/accounts/aggregators/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/accounts/aggregators',
    resetEnabled: true,
    layout: {
        type: 'columns',
        columns: 3,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'Aggregator Name',
            required: true,
        },
        {
            name: 'code',
            type: 'text',
            label: 'Aggregator Code',
            required: true,
        },
        {
            name: 'registration_number',
            type: 'text',
            label: 'Registration Number',
            required: true,
        },
        {
            name: 'tpin',
            type: 'text',
            label: 'TPIN',
            required: true,
        },
        {
            name: 'aggregator_type',
            type: 'select',
            label: 'Aggregator Type',
            required: true,
            options: [
                { label: 'Corporate Aggregator', value: 'corporate' },
                { label: 'Fleet Aggregator', value: 'fleet' },
                { label: 'Government Aggregator', value: 'government' },
                { label: 'NGO Aggregator', value: 'ngo' },
                { label: 'General Aggregator', value: 'general' },
            ],
        },
        {
            name: 'commission_type',
            type: 'select',
            label: 'Commission Type',
            options: [
                { label: 'Percentage', value: 'percentage' },
                { label: 'Fixed Amount', value: 'fixed' },
                { label: 'None', value: 'none' },
            ],
        },
        {
            name: 'commission_rate',
            type: 'number',
            label: 'Commission Rate',
            default_value: 0,
        },
        {
            name: 'email',
            type: 'email',
            label: 'Email',
            required: true,
        },
        {
            name: 'phone',
            type: 'text',
            label: 'Phone',
            required: true,
        },
        {
            name: 'contact_person',
            type: 'text',
            label: 'Contact Person',
            required: true,
        },
        {
            name: 'contact_person_phone',
            type: 'text',
            label: 'Contact Person Phone',
            required: true,
        },
        {
            name: 'province',
            type: 'text',
            label: 'Province',
            required: true,
        },
        {
            name: 'district',
            type: 'text',
            label: 'District',
            required: true,
        },
        {
            name: 'address',
            type: 'textarea',
            label: 'Address',
            rows: 4,
            required: true,
        },
        {
            name: 'account_number',
            type: 'text',
            label: 'Account Number',
        },
        {
            name: 'credit_limit',
            type: 'number',
            label: 'Credit Limit',
            default_value: 0,
        },
        {
            name: 'verification_status',
            type: 'select',
            label: 'Verification Status',
            default_value: 'pending',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Verified', value: 'verified' },
                { label: 'Rejected', value: 'rejected' },
            ],
        },
        {
            name: 'status',
            type: 'select',
            label: 'Status',
            default_value: 'pending',
            required: true,
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Suspended', value: 'suspended' },
            ],
        },
    ],
}

const raw: PageConfig = {
    id: 'aggregators',
    title: 'Aggregators',
    page_title: 'Aggregators',
    description: 'Manage aggregators and the accounts managed under them.',
    type: 'list',
    page_type: 'list',
    path: '/accounts/aggregators',
    route: '/accounts/aggregators',

    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total Aggregators',
            dataPath: 'statistics.total',
            icon: 'Network',
            format: 'number',
        },
        {
            id: 'active',
            type: 'statistic',
            title: 'Active',
            dataPath: 'statistics.active',
            icon: 'CircleCheck',
            format: 'number',
        },
        {
            id: 'managed-accounts',
            type: 'statistic',
            title: 'Managed Accounts',
            dataPath: 'statistics.managed_accounts',
            icon: 'Users',
            format: 'number',
        },
        {
            id: 'suspended',
            type: 'statistic',
            title: 'Suspended',
            dataPath: 'statistics.suspended',
            icon: 'Ban',
            format: 'number',
        },
    ],

    filters: [
        {
            id: 'search',
            type: 'search',
            label: 'Search',
            field: 'search',
            query_parameter: 'search',
            placeholder: 'Search aggregator name, code or account number',
        },
        {
            id: 'type',
            type: 'select',
            label: 'Aggregator Type',
            field: 'aggregator_type',
            query_parameter: 'aggregator_type',
            options: [
                { label: 'Corporate', value: 'corporate' },
                { label: 'Fleet', value: 'fleet' },
                { label: 'Government', value: 'government' },
                { label: 'NGO', value: 'ngo' },
                { label: 'General', value: 'general' },
            ],
        },
        {
            id: 'status',
            type: 'select',
            label: 'Status',
            field: 'status',
            query_parameter: 'status',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Active', value: 'active' },
                { label: 'Suspended', value: 'suspended' },
            ],
        },
    ],

    table: {
        rowKey: 'id',
        stickyHeader: true,
        striped: true,

        pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50],
        },

        sorting: {
            enabled: true,
            defaultColumn: 'name',
            defaultDirection: 'asc',
        },

        columns: [
            {
                id: 'account-number',
                type: 'text',
                header: 'Account No.',
                accessor: 'account_number',
            },
            {
                id: 'code',
                type: 'text',
                header: 'Code',
                accessor: 'code',
                sortable: true,
            },
            {
                id: 'name',
                type: 'text',
                header: 'Aggregator',
                accessor: 'name',
                sortable: true,
                searchable: true,
            },
            {
                id: 'type',
                type: 'text',
                header: 'Type',
                accessor: 'aggregator_type',
            },
            {
                id: 'managed-accounts',
                type: 'number',
                header: 'Accounts',
                accessor: 'total_managed_accounts',
            },
            {
                id: 'vehicles',
                type: 'number',
                header: 'Vehicles',
                accessor: 'total_vehicles',
            },
            {
                id: 'balance',
                type: 'number',
                header: 'Balance',
                accessor: 'account_balance',
            },
            {
                id: 'commission',
                type: 'number',
                header: 'Commission',
                accessor: 'commission_rate',
            },
            {
                id: 'verification',
                type: 'badge',
                header: 'Verification',
                accessor: 'verification_status',
                options: {
                    verified: 'success',
                    pending: 'warning',
                    rejected: 'danger',
                },
            },
            {
                id: 'status',
                type: 'badge',
                header: 'Status',
                accessor: 'status',
                options: {
                    active: 'success',
                    pending: 'warning',
                    suspended: 'danger',
                },
            },
            {
                id: 'actions',
                type: 'actions',
                header: 'Actions',
                actions: [
                    {
                        id: 'view',
                        type: 'navigate',
                        label: 'View',
                        icon: 'Eye',
                    },
                    {
                        id: 'managed-accounts',
                        type: 'navigate',
                        label: 'Managed Accounts',
                        icon: 'Users',
                        path: '/accounts/aggregators/{id}/accounts',
                    },
                    {
                        id: 'edit',
                        type: 'edit',
                        label: 'Edit',
                        icon: 'Pencil',
                    },
                    {
                        id: 'delete',
                        type: 'delete',
                        label: 'Delete',
                        icon: 'Trash2',
                        endpoint: '/api/accounts/aggregators/{id}',
                        requires_confirmation: true,
                        confirmation: 'Delete this aggregator?',
                        success_message: 'Aggregator deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add',
            type: 'navigate',
            label: 'Add Aggregator',
            icon: 'Plus',
            path: '/accounts/aggregators/create',
        },
    ],

    sub_pages: [
        {
            id: 'aggregators-create',
            parentId: 'aggregators',
            title: 'Add Aggregator',
            page_title: 'Add Aggregator',
            type: 'create',
            page_type: 'create',
            path: '/accounts/aggregators/create',
            route: '/accounts/aggregators/create',
            api,
            form: {
                ...form,
                submitLabel: 'Add Aggregator',
            },
        },
        {
            id: 'aggregators-details',
            parentId: 'aggregators',
            title: 'Aggregator Details',
            page_title: 'Aggregator Details',
            type: 'details',
            page_type: 'details',
            path: '/accounts/aggregators/:id',
            route: '/accounts/aggregators/:id',
            api,
            recordIdParam: 'id',

            fields: [
                'name',
                'code',
                'account_number',
                'registration_number',
                'tpin',
                'aggregator_type',
                'commission_type',
                'commission_rate',
                'total_managed_accounts',
                'total_vehicles',
                'account_balance',
                'verification_status',
                'status',
            ],

            sections: [
                {
                    id: 'overview',
                    title: 'Aggregator Information',
                    fields: [
                        { key: 'name', label: 'Name', type: 'text' },
                        { key: 'code', label: 'Code', type: 'text' },
                        { key: 'aggregator_type', label: 'Type', type: 'text' },
                        { key: 'registration_number', label: 'Registration Number', type: 'text' },
                        { key: 'tpin', label: 'TPIN', type: 'text' },
                    ],
                },
                {
                    id: 'management',
                    title: 'Managed Accounts',
                    fields: [
                        { key: 'total_managed_accounts', label: 'Managed Accounts', type: 'number' },
                        { key: 'total_vehicles', label: 'Vehicles', type: 'number' },
                        { key: 'commission_type', label: 'Commission Type', type: 'text' },
                        { key: 'commission_rate', label: 'Commission Rate', type: 'number' },
                    ],
                },
            ],
        },
        {
            id: 'aggregators-edit',
            parentId: 'aggregators',
            title: 'Edit Aggregator',
            page_title: 'Edit Aggregator',
            type: 'edit',
            page_type: 'edit',
            path: '/accounts/aggregators/:id/edit',
            route: '/accounts/aggregators/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const aggregatorsListConfig = validateConfig(
    'aggregators list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const aggregatorsCreateConfig = validateConfig(
    'aggregators create page',
    pageConfigSchema,
    aggregatorsListConfig.sub_pages?.find((page) => page.type === 'create'),
)

export const aggregatorsDetailsConfig = validateConfig(
    'aggregators details page',
    pageConfigSchema,
    aggregatorsListConfig.sub_pages?.find((page) => page.type === 'details'),
)

export const aggregatorsEditConfig = validateConfig(
    'aggregators edit page',
    pageConfigSchema,
    aggregatorsListConfig.sub_pages?.find((page) => page.type === 'edit'),
)