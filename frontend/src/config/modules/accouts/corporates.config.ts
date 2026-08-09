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
        list: {
            path: '/accounts/corporate-companies',
            method: 'GET',
        },
        item: {
            path: '/accounts/corporate-companies/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/accounts/corporate-companies',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/accounts/corporate-companies/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/accounts/corporate-companies/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/accounts/corporate-companies',
    resetEnabled: true,
    layout: {
        type: 'columns',
        columns: 3,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'Company Name',
            required: true,
            validation: {
                min_length: 2,
                max_length: 150,
            },
        },
        {
            name: 'code',
            type: 'text',
            label: 'Company Code',
            required: true,
            validation: {
                min_length: 2,
                max_length: 30,
            },
        },
        {
            name: 'trading_name',
            type: 'text',
            label: 'Trading Name',
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
            name: 'sector',
            type: 'select',
            label: 'Business Sector',
            required: true,
            options: [
                { label: 'Mining', value: 'mining' },
                { label: 'Construction', value: 'construction' },
                { label: 'Agriculture', value: 'agriculture' },
                { label: 'Transport', value: 'transport' },
                { label: 'Manufacturing', value: 'manufacturing' },
                { label: 'Retail', value: 'retail' },
                { label: 'Financial Services', value: 'financial_services' },
                { label: 'Telecommunications', value: 'telecommunications' },
                { label: 'Other', value: 'other' },
            ],
        },
        {
            name: 'email',
            type: 'email',
            label: 'Company Email',
            required: true,
        },
        {
            name: 'phone',
            type: 'text',
            label: 'Phone Number',
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
            name: 'contact_person_email',
            type: 'email',
            label: 'Contact Person Email',
        },
        {
            name: 'province',
            type: 'select',
            label: 'Province',
            required: true,
            options: [
                { label: 'Central', value: 'Central' },
                { label: 'Copperbelt', value: 'Copperbelt' },
                { label: 'Eastern', value: 'Eastern' },
                { label: 'Luapula', value: 'Luapula' },
                { label: 'Lusaka', value: 'Lusaka' },
                { label: 'Muchinga', value: 'Muchinga' },
                { label: 'Northern', value: 'Northern' },
                { label: 'North-Western', value: 'North-Western' },
                { label: 'Southern', value: 'Southern' },
                { label: 'Western', value: 'Western' },
            ],
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
            name: 'payment_terms',
            type: 'select',
            label: 'Payment Terms',
            default_value: 'prepaid',
            options: [
                { label: 'Prepaid', value: 'prepaid' },
                { label: '7 Days', value: '7_days' },
                { label: '14 Days', value: '14_days' },
                { label: '30 Days', value: '30_days' },
                { label: '60 Days', value: '60_days' },
            ],
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
                { label: 'Blocked', value: 'blocked' },
            ],
        },
    ],
}

const raw: PageConfig = {
    id: 'corporate-companies',
    title: 'Corporate Companies',
    page_title: 'Corporate Companies',
    description: 'Manage corporate fuel account holders.',
    type: 'list',
    page_type: 'list',
    path: '/accounts/corporate-companies',
    route: '/accounts/corporate-companies',

    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total Companies',
            dataPath: 'statistics.total',
            icon: 'Building2',
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
            placeholder: 'Search company, account number, TPIN or code',
        },
        {
            id: 'sector',
            type: 'select',
            label: 'Sector',
            field: 'sector',
            query_parameter: 'sector',
            options: [
                { label: 'Mining', value: 'mining' },
                { label: 'Construction', value: 'construction' },
                { label: 'Agriculture', value: 'agriculture' },
                { label: 'Transport', value: 'transport' },
                { label: 'Manufacturing', value: 'manufacturing' },
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
                { label: 'Inactive', value: 'inactive' },
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
            pageSizeOptions: [10, 20, 50, 100],
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
                sortable: true,
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
                header: 'Company',
                accessor: 'name',
                sortable: true,
                searchable: true,
            },
            {
                id: 'sector',
                type: 'text',
                header: 'Sector',
                accessor: 'sector',
                sortable: true,
            },
            {
                id: 'province',
                type: 'text',
                header: 'Province',
                accessor: 'province',
                sortable: true,
            },
            {
                id: 'vehicles',
                type: 'number',
                header: 'Vehicles',
                accessor: 'total_vehicles',
            },
            {
                id: 'cards',
                type: 'number',
                header: 'Cards',
                accessor: 'total_cards',
            },
            {
                id: 'balance',
                type: 'number',
                header: 'Balance',
                accessor: 'account_balance',
                sortable: true,
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
                    suspended: 'warning',
                    blocked: 'danger',
                },
            },
            {
                id: 'created',
                type: 'datetime',
                header: 'Created',
                accessor: 'created_at',
                sortable: true,
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
                        permission: {
                            any: ['corporate_companies.update'],
                        },
                    },
                    {
                        id: 'delete',
                        type: 'delete',
                        label: 'Delete',
                        icon: 'Trash2',
                        endpoint: '/api/accounts/corporate-companies/{id}',
                        permission: {
                            any: ['corporate_companies.delete'],
                        },
                        requires_confirmation: true,
                        confirmation: 'Delete this corporate company?',
                        success_message: 'Corporate company deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add',
            type: 'navigate',
            label: 'Add Corporate Company',
            icon: 'Plus',
            path: '/accounts/corporate-companies/create',
        },
    ],

    sub_pages: [
        {
            id: 'corporate-companies-create',
            parentId: 'corporate-companies',
            title: 'Add Corporate Company',
            page_title: 'Add Corporate Company',
            type: 'create',
            page_type: 'create',
            path: '/accounts/corporate-companies/create',
            route: '/accounts/corporate-companies/create',
            api,
            form: {
                ...form,
                submitLabel: 'Add Corporate Company',
            },
        },
        {
            id: 'corporate-companies-details',
            parentId: 'corporate-companies',
            title: 'Corporate Company Details',
            page_title: 'Corporate Company Details',
            type: 'details',
            page_type: 'details',
            path: '/accounts/corporate-companies/:id',
            route: '/accounts/corporate-companies/:id',
            api,
            recordIdParam: 'id',

            fields: [
                'name',
                'code',
                'account_number',
                'registration_number',
                'tpin',
                'sector',
                'email',
                'phone',
                'contact_person',
                'province',
                'district',
                'address',
                'account_balance',
                'credit_limit',
                'verification_status',
                'status',
            ],

            sections: [
                {
                    id: 'company',
                    title: 'Company Information',
                    fields: [
                        { key: 'name', label: 'Company Name', type: 'text' },
                        { key: 'code', label: 'Code', type: 'text', copyable: true },
                        { key: 'account_number', label: 'Account Number', type: 'text', copyable: true },
                        { key: 'registration_number', label: 'Registration Number', type: 'text' },
                        { key: 'tpin', label: 'TPIN', type: 'text' },
                        { key: 'sector', label: 'Sector', type: 'text' },
                    ],
                },
                {
                    id: 'financial',
                    title: 'Account Information',
                    fields: [
                        { key: 'account_balance', label: 'Balance', type: 'number' },
                        { key: 'credit_limit', label: 'Credit Limit', type: 'number' },
                        { key: 'payment_terms', label: 'Payment Terms', type: 'text' },
                    ],
                },
                {
                    id: 'status',
                    title: 'Status',
                    fields: [
                        {
                            key: 'verification_status',
                            label: 'Verification',
                            type: 'badge',
                            badgeVariants: {
                                verified: 'success',
                                pending: 'warning',
                                rejected: 'danger',
                            },
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            type: 'badge',
                            badgeVariants: {
                                active: 'success',
                                pending: 'warning',
                                suspended: 'warning',
                                inactive: 'warning',
                                blocked: 'danger',
                            },
                        },
                    ],
                },
            ],
        },
        {
            id: 'corporate-companies-edit',
            parentId: 'corporate-companies',
            title: 'Edit Corporate Company',
            page_title: 'Edit Corporate Company',
            type: 'edit',
            page_type: 'edit',
            path: '/accounts/corporate-companies/:id/edit',
            route: '/accounts/corporate-companies/:id/edit',
            authentication: { required: true },
            permissions: {
                any: ['corporate_companies.update'],
            },
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const corporateCompaniesListConfig = validateConfig(
    'corporate companies list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const corporateCompaniesCreateConfig = validateConfig(
    'corporate companies create page',
    pageConfigSchema,
    corporateCompaniesListConfig.sub_pages?.find(
        (page) => page.type === 'create',
    ),
)

export const corporateCompaniesDetailsConfig = validateConfig(
    'corporate companies details page',
    pageConfigSchema,
    corporateCompaniesListConfig.sub_pages?.find(
        (page) => page.type === 'details',
    ),
)

export const corporateCompaniesEditConfig = validateConfig(
    'corporate companies edit page',
    pageConfigSchema,
    corporateCompaniesListConfig.sub_pages?.find(
        (page) => page.type === 'edit',
    ),
)