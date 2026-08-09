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
        list: { path: '/accounts/ngos', method: 'GET' },
        item: {
            path: '/accounts/ngos/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/accounts/ngos',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/accounts/ngos/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/accounts/ngos/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/accounts/ngos',
    resetEnabled: true,
    layout: {
        type: 'columns',
        columns: 3,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'NGO Name',
            required: true,
        },
        {
            name: 'code',
            type: 'text',
            label: 'NGO Code',
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
        },
        {
            name: 'ngo_type',
            type: 'select',
            label: 'NGO Type',
            required: true,
            options: [
                { label: 'Local NGO', value: 'local' },
                { label: 'International NGO', value: 'international' },
                { label: 'Foundation', value: 'foundation' },
                { label: 'Charity', value: 'charity' },
                { label: 'Faith Based Organization', value: 'faith_based' },
            ],
        },
        {
            name: 'sector',
            type: 'select',
            label: 'Primary Sector',
            required: true,
            options: [
                { label: 'Health', value: 'health' },
                { label: 'Education', value: 'education' },
                { label: 'Agriculture', value: 'agriculture' },
                { label: 'Environment', value: 'environment' },
                { label: 'Humanitarian', value: 'humanitarian' },
                { label: 'Community Development', value: 'community_development' },
                { label: 'Other', value: 'other' },
            ],
        },
        {
            name: 'funding_organization',
            type: 'text',
            label: 'Primary Funding Organization',
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
            label: 'Physical Address',
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
            required: true,
            default_value: 'pending',
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
    id: 'ngos',
    title: 'NGOs',
    page_title: 'Non-Governmental Organizations',
    description: 'Manage NGO fuel accounts and allocations.',
    type: 'list',
    page_type: 'list',
    path: '/accounts/ngos',
    route: '/accounts/ngos',
    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total NGOs',
            dataPath: 'statistics.total',
            icon: 'HeartHandshake',
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
            id: 'pending',
            type: 'statistic',
            title: 'Pending',
            dataPath: 'statistics.pending',
            icon: 'Clock',
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
            placeholder: 'Search NGO name, account number or registration',
        },
        {
            id: 'ngo-type',
            type: 'select',
            label: 'NGO Type',
            field: 'ngo_type',
            query_parameter: 'ngo_type',
            options: [
                { label: 'Local', value: 'local' },
                { label: 'International', value: 'international' },
                { label: 'Foundation', value: 'foundation' },
                { label: 'Charity', value: 'charity' },
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
                header: 'NGO',
                accessor: 'name',
                searchable: true,
                sortable: true,
            },
            {
                id: 'ngo-type',
                type: 'text',
                header: 'Type',
                accessor: 'ngo_type',
            },
            {
                id: 'sector',
                type: 'text',
                header: 'Sector',
                accessor: 'sector',
            },
            {
                id: 'province',
                type: 'text',
                header: 'Province',
                accessor: 'province',
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
                    inactive: 'warning',
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
                        endpoint: '/api/accounts/ngos/{id}',
                        requires_confirmation: true,
                        confirmation: 'Delete this NGO?',
                        success_message: 'NGO deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add',
            type: 'navigate',
            label: 'Add NGO',
            icon: 'Plus',
            path: '/accounts/ngos/create',
        },
    ],

    sub_pages: [
        {
            id: 'ngos-create',
            parentId: 'ngos',
            title: 'Add NGO',
            page_title: 'Add NGO',
            type: 'create',
            page_type: 'create',
            path: '/accounts/ngos/create',
            route: '/accounts/ngos/create',
            api,
            form: {
                ...form,
                submitLabel: 'Add NGO',
            },
        },
        {
            id: 'ngos-details',
            parentId: 'ngos',
            title: 'NGO Details',
            page_title: 'NGO Details',
            type: 'details',
            page_type: 'details',
            path: '/accounts/ngos/:id',
            route: '/accounts/ngos/:id',
            api,
            recordIdParam: 'id',

            fields: [
                'name',
                'code',
                'account_number',
                'registration_number',
                'ngo_type',
                'sector',
                'funding_organization',
                'email',
                'phone',
                'province',
                'district',
                'address',
                'account_balance',
                'verification_status',
                'status',
            ],

            sections: [
                {
                    id: 'overview',
                    title: 'NGO Information',
                    fields: [
                        { key: 'name', label: 'NGO Name', type: 'text' },
                        { key: 'code', label: 'Code', type: 'text' },
                        { key: 'registration_number', label: 'Registration Number', type: 'text' },
                        { key: 'ngo_type', label: 'NGO Type', type: 'text' },
                        { key: 'sector', label: 'Sector', type: 'text' },
                        { key: 'funding_organization', label: 'Funding Organization', type: 'text' },
                    ],
                },
                {
                    id: 'account',
                    title: 'Account',
                    fields: [
                        { key: 'account_number', label: 'Account Number', type: 'text' },
                        { key: 'account_balance', label: 'Balance', type: 'number' },
                        { key: 'credit_limit', label: 'Credit Limit', type: 'number' },
                    ],
                },
            ],
        },
        {
            id: 'ngos-edit',
            parentId: 'ngos',
            title: 'Edit NGO',
            page_title: 'Edit NGO',
            type: 'edit',
            page_type: 'edit',
            path: '/accounts/ngos/:id/edit',
            route: '/accounts/ngos/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const ngosListConfig = validateConfig(
    'NGO list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const ngosCreateConfig = validateConfig(
    'NGO create page',
    pageConfigSchema,
    ngosListConfig.sub_pages?.find((page) => page.type === 'create'),
)

export const ngosDetailsConfig = validateConfig(
    'NGO details page',
    pageConfigSchema,
    ngosListConfig.sub_pages?.find((page) => page.type === 'details'),
)

export const ngosEditConfig = validateConfig(
    'NGO edit page',
    pageConfigSchema,
    ngosListConfig.sub_pages?.find((page) => page.type === 'edit'),
)