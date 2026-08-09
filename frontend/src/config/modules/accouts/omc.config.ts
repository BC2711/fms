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
            path: '/accounts/oil-marketing-companies',
            method: 'GET',
        },

        item: {
            path: '/accounts/oil-marketing-companies/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },

        create: {
            path: '/accounts/oil-marketing-companies',
            method: 'POST',
            responseMappingPath: 'data',
        },

        update: {
            path: '/accounts/oil-marketing-companies/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },

        delete: {
            path: '/accounts/oil-marketing-companies/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/accounts/oil-marketing-companies',

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
            placeholder: 'Enter company name',
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
            placeholder: 'e.g. OMC-001',
            validation: {
                min_length: 2,
                max_length: 30,
            },
        },

        {
            name: 'trading_name',
            type: 'text',
            label: 'Trading Name',
            placeholder: 'Enter trading name',
            validation: {
                max_length: 150,
            },
        },

        {
            name: 'registration_number',
            type: 'text',
            label: 'Registration Number',
            required: true,
            placeholder: 'Enter PACRA registration number',
            validation: {
                min_length: 2,
                max_length: 100,
            },
        },

        {
            name: 'tpin',
            type: 'text',
            label: 'TPIN',
            required: true,
            placeholder: 'Enter TPIN',
            validation: {
                min_length: 5,
                max_length: 30,
            },
        },

        {
            name: 'license_number',
            type: 'text',
            label: 'ERB Licence Number',
            required: true,
            placeholder: 'Enter ERB licence number',
            validation: {
                min_length: 2,
                max_length: 100,
            },
        },

        {
            name: 'license_expiry_date',
            type: 'date',
            label: 'Licence Expiry Date',
            required: true,
        },

        {
            name: 'company_type',
            type: 'select',
            label: 'Company Type',
            required: true,
            default_value: 'oil_marketing_company',

            options: [
                {
                    label: 'Oil Marketing Company',
                    value: 'oil_marketing_company',
                },
                {
                    label: 'Fuel Distributor',
                    value: 'fuel_distributor',
                },
                {
                    label: 'Fuel Importer',
                    value: 'fuel_importer',
                },
                {
                    label: 'Fuel Wholesaler',
                    value: 'fuel_wholesaler',
                },
            ],
        },

        {
            name: 'email',
            type: 'email',
            label: 'Company Email',
            required: true,
            placeholder: 'info@company.com',
            validation: {
                max_length: 150,
            },
        },

        {
            name: 'phone',
            type: 'text',
            label: 'Phone Number',
            required: true,
            placeholder: '+260...',
            validation: {
                min_length: 7,
                max_length: 30,
            },
        },

        {
            name: 'alternative_phone',
            type: 'text',
            label: 'Alternative Phone',
            placeholder: '+260...',
            validation: {
                max_length: 30,
            },
        },

        {
            name: 'website',
            type: 'text',
            label: 'Website',
            placeholder: 'https://example.com',
            validation: {
                max_length: 200,
            },
        },

        {
            name: 'contact_person',
            type: 'text',
            label: 'Contact Person',
            required: true,
            placeholder: 'Enter contact person',
            validation: {
                min_length: 2,
                max_length: 150,
            },
        },

        {
            name: 'contact_person_phone',
            type: 'text',
            label: 'Contact Person Phone',
            required: true,
            placeholder: '+260...',
            validation: {
                min_length: 7,
                max_length: 30,
            },
        },

        {
            name: 'contact_person_email',
            type: 'email',
            label: 'Contact Person Email',
            placeholder: 'contact@example.com',
            validation: {
                max_length: 150,
            },
        },

        {
            name: 'province',
            type: 'select',
            label: 'Province',
            required: true,

            options: [
                {
                    label: 'Central',
                    value: 'Central',
                },
                {
                    label: 'Copperbelt',
                    value: 'Copperbelt',
                },
                {
                    label: 'Eastern',
                    value: 'Eastern',
                },
                {
                    label: 'Luapula',
                    value: 'Luapula',
                },
                {
                    label: 'Lusaka',
                    value: 'Lusaka',
                },
                {
                    label: 'Muchinga',
                    value: 'Muchinga',
                },
                {
                    label: 'Northern',
                    value: 'Northern',
                },
                {
                    label: 'North-Western',
                    value: 'North-Western',
                },
                {
                    label: 'Southern',
                    value: 'Southern',
                },
                {
                    label: 'Western',
                    value: 'Western',
                },
            ],
        },

        {
            name: 'district',
            type: 'text',
            label: 'District',
            required: true,
            placeholder: 'Enter district',
            validation: {
                max_length: 100,
            },
        },

        {
            name: 'city',
            type: 'text',
            label: 'City / Town',
            placeholder: 'Enter city or town',
            validation: {
                max_length: 100,
            },
        },

        {
            name: 'address',
            type: 'textarea',
            label: 'Physical Address',
            required: true,
            rows: 4,
            placeholder: 'Enter company physical address',
        },

        {
            name: 'postal_address',
            type: 'textarea',
            label: 'Postal Address',
            rows: 3,
            placeholder: 'Enter postal address',
        },

        {
            name: 'account_number',
            type: 'text',
            label: 'Account Number',
            placeholder: 'Auto-generated if left blank',
            validation: {
                max_length: 50,
            },
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
                {
                    label: 'Prepaid',
                    value: 'prepaid',
                },
                {
                    label: '7 Days',
                    value: '7_days',
                },
                {
                    label: '14 Days',
                    value: '14_days',
                },
                {
                    label: '30 Days',
                    value: '30_days',
                },
                {
                    label: '60 Days',
                    value: '60_days',
                },
                {
                    label: '90 Days',
                    value: '90_days',
                },
            ],
        },

        {
            name: 'currency',
            type: 'select',
            label: 'Currency',
            required: true,
            default_value: 'ZMW',

            options: [
                {
                    label: 'Zambian Kwacha (ZMW)',
                    value: 'ZMW',
                },
                {
                    label: 'US Dollar (USD)',
                    value: 'USD',
                },
            ],
        },

        {
            name: 'verification_status',
            type: 'select',
            label: 'Verification Status',
            required: true,
            default_value: 'pending',

            options: [
                {
                    label: 'Pending',
                    value: 'pending',
                },
                {
                    label: 'Verified',
                    value: 'verified',
                },
                {
                    label: 'Rejected',
                    value: 'rejected',
                },
            ],
        },

        {
            name: 'status',
            type: 'select',
            label: 'Account Status',
            required: true,
            default_value: 'pending',

            options: [
                {
                    label: 'Pending',
                    value: 'pending',
                },
                {
                    label: 'Active',
                    value: 'active',
                },
                {
                    label: 'Inactive',
                    value: 'inactive',
                },
                {
                    label: 'Suspended',
                    value: 'suspended',
                },
                {
                    label: 'Blocked',
                    value: 'blocked',
                },
            ],
        },

        {
            name: 'notes',
            type: 'textarea',
            label: 'Notes',
            rows: 4,
            placeholder: 'Enter additional notes',
        },
    ],
}

const raw: PageConfig = {
    id: 'oil-marketing-companies',

    title: 'Oil Marketing Companies',

    page_title: 'Oil Marketing Companies',

    description:
        'Manage registered oil marketing companies, licences, stations, account balances, verification and operational status.',

    type: 'list',

    page_type: 'list',

    path: '/accounts/oil-marketing-companies',

    route: '/accounts/oil-marketing-companies',

    // authentication: {
    //     required: true,
    // },

    // permissions: {
    //     any: ['oil_marketing_companies.view'],
    // },

    api,

    statistics: [
        {
            id: 'total-oil-marketing-companies',
            type: 'statistic',
            title: 'Total OMCs',
            dataPath: 'statistics.total',
            icon: 'Building2',
            format: 'number',
        },

        {
            id: 'active-oil-marketing-companies',
            type: 'statistic',
            title: 'Active',
            dataPath: 'statistics.active',
            icon: 'CircleCheck',
            format: 'number',
        },

        {
            id: 'pending-oil-marketing-companies',
            type: 'statistic',
            title: 'Pending',
            dataPath: 'statistics.pending',
            icon: 'Clock',
            format: 'number',
        },

        {
            id: 'suspended-oil-marketing-companies',
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
            placeholder:
                'Search company name, code, account number, TPIN or licence',
        },

        {
            id: 'status',
            type: 'select',
            label: 'Status',
            field: 'status',
            query_parameter: 'status',

            options: [
                {
                    label: 'Pending',
                    value: 'pending',
                },
                {
                    label: 'Active',
                    value: 'active',
                },
                {
                    label: 'Inactive',
                    value: 'inactive',
                },
                {
                    label: 'Suspended',
                    value: 'suspended',
                },
                {
                    label: 'Blocked',
                    value: 'blocked',
                },
            ],
        },

        {
            id: 'verification-status',
            type: 'select',
            label: 'Verification',
            field: 'verification_status',
            query_parameter: 'verification_status',

            options: [
                {
                    label: 'Pending',
                    value: 'pending',
                },
                {
                    label: 'Verified',
                    value: 'verified',
                },
                {
                    label: 'Rejected',
                    value: 'rejected',
                },
            ],
        },

        {
            id: 'province',
            type: 'select',
            label: 'Province',
            field: 'province',
            query_parameter: 'province',

            options: [
                {
                    label: 'Central',
                    value: 'Central',
                },
                {
                    label: 'Copperbelt',
                    value: 'Copperbelt',
                },
                {
                    label: 'Eastern',
                    value: 'Eastern',
                },
                {
                    label: 'Luapula',
                    value: 'Luapula',
                },
                {
                    label: 'Lusaka',
                    value: 'Lusaka',
                },
                {
                    label: 'Muchinga',
                    value: 'Muchinga',
                },
                {
                    label: 'Northern',
                    value: 'Northern',
                },
                {
                    label: 'North-Western',
                    value: 'North-Western',
                },
                {
                    label: 'Southern',
                    value: 'Southern',
                },
                {
                    label: 'Western',
                    value: 'Western',
                },
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
                searchable: true,
            },

            {
                id: 'code',
                type: 'text',
                header: 'Code',
                accessor: 'code',
                sortable: true,
                searchable: true,
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
                id: 'license-number',
                type: 'text',
                header: 'ERB Licence',
                accessor: 'license_number',
                sortable: true,
                searchable: true,
            },

            {
                id: 'tpin',
                type: 'text',
                header: 'TPIN',
                accessor: 'tpin',
                sortable: true,
                searchable: true,
            },

            {
                id: 'province',
                type: 'text',
                header: 'Province',
                accessor: 'province',
                sortable: true,
            },

            {
                id: 'stations',
                type: 'number',
                header: 'Stations',
                accessor: 'total_stations',
                sortable: true,
            },

            {
                id: 'balance',
                type: 'number',
                header: 'Balance',
                accessor: 'account_balance',
                sortable: true,
            },

            {
                id: 'verification-status',
                type: 'badge',
                header: 'Verification',
                accessor: 'verification_status',
                sortable: true,

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
                sortable: true
            },

            {
                id: 'created-at',
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
                            any: ['oil_marketing_companies.update'],
                        },
                    },

                    {
                        id: 'stations',
                        type: 'navigate',
                        label: 'Stations',
                        icon: 'MapPin',
                        path: '/accounts/oil-marketing-companies/{id}/stations',
                    },

                    {
                        id: 'transactions',
                        type: 'navigate',
                        label: 'Transactions',
                        icon: 'Receipt',
                        path: '/accounts/oil-marketing-companies/{id}/transactions',
                    },

                    {
                        id: 'statement',
                        type: 'navigate',
                        label: 'Statement',
                        icon: 'FileText',
                        path: '/accounts/oil-marketing-companies/{id}/statement',
                    },

                    {
                        id: 'delete',
                        type: 'delete',
                        label: 'Delete',
                        icon: 'Trash2',

                        endpoint:
                            '/api/accounts/oil-marketing-companies/{id}',

                        permission: {
                            any: ['oil_marketing_companies.delete'],
                        },

                        requires_confirmation: true,

                        confirmation:
                            'Are you sure you want to delete this oil marketing company?',

                        success_message:
                            'Oil marketing company deleted successfully.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add-oil-marketing-company',
            type: 'navigate',
            label: 'Add Oil Marketing Company',
            icon: 'Plus',
            path: '/accounts/oil-marketing-companies/create',

            // permission: {
            //     any: ['oil_marketing_companies.create'],
            // },
        },
    ],

    sub_pages: [
        {
            id: 'oil-marketing-companies-create',

            parentId: 'oil-marketing-companies',

            title: 'Add Oil Marketing Company',

            page_title: 'Add Oil Marketing Company',

            description:
                'Register a new oil marketing company in the fuel management system.',

            type: 'create',

            page_type: 'create',

            path: '/accounts/oil-marketing-companies/create',

            route: '/accounts/oil-marketing-companies/create',

            // authentication: {
            //     required: true,
            // },

            // permissions: {
            //     any: ['oil_marketing_companies.create'],
            // },

            api,

            form: {
                ...form,

                submitLabel: 'Add Oil Marketing Company',
            },
        },

        {
            id: 'oil-marketing-companies-details',

            parentId: 'oil-marketing-companies',

            title: 'Oil Marketing Company Details',

            page_title: 'Oil Marketing Company Details',

            type: 'details',

            page_type: 'details',

            path: '/accounts/oil-marketing-companies/:id',

            route: '/accounts/oil-marketing-companies/:id',

            // authentication: {
            //     required: true,
            // },

            // permissions: {
            //     any: ['oil_marketing_companies.view'],
            // },

            api,

            recordIdParam: 'id',

            fields: [
                'name',
                'code',
                'trading_name',
                'account_number',
                'registration_number',
                'tpin',
                'license_number',
                'license_expiry_date',
                'email',
                'phone',
                'contact_person',
                'province',
                'district',
                'address',
                'account_balance',
                'credit_limit',
                'payment_terms',
                'verification_status',
                'status',
            ],

            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back',
                    path: '/accounts/oil-marketing-companies',
                    variant: 'secondary',
                },

                {
                    id: 'edit',
                    type: 'edit',
                    label: 'Edit',
                    icon: 'Pencil',
                    path:
                        '/accounts/oil-marketing-companies/{id}/edit',

                    permission: {
                        any: ['oil_marketing_companies.update'],
                    },
                },

                {
                    id: 'stations',
                    type: 'navigate',
                    label: 'View Stations',
                    icon: 'MapPin',
                    path:
                        '/accounts/oil-marketing-companies/{id}/stations',
                },

                {
                    id: 'statement',
                    type: 'navigate',
                    label: 'Account Statement',
                    icon: 'FileText',
                    path:
                        '/accounts/oil-marketing-companies/{id}/statement',
                },
            ],

            sections: [
                {
                    id: 'company-information',

                    title: 'Company Information',

                    fields: [
                        {
                            key: 'name',
                            label: 'Company Name',
                            type: 'text',
                        },

                        {
                            key: 'trading_name',
                            label: 'Trading Name',
                            type: 'text',
                        },

                        {
                            key: 'code',
                            label: 'Company Code',
                            type: 'text',
                            copyable: true,
                        },

                        {
                            key: 'account_number',
                            label: 'Account Number',
                            type: 'text',
                            copyable: true,
                        },

                        {
                            key: 'registration_number',
                            label: 'Registration Number',
                            type: 'text',
                            copyable: true,
                        },

                        {
                            key: 'tpin',
                            label: 'TPIN',
                            type: 'text',
                            copyable: true,
                        },
                    ],
                },

                {
                    id: 'licensing',

                    title: 'Licensing & Verification',

                    fields: [
                        {
                            key: 'license_number',
                            label: 'ERB Licence Number',
                            type: 'text',
                            copyable: true,
                        },

                        {
                            key: 'license_expiry_date',
                            label: 'Licence Expiry Date',
                            type: 'text',
                        },

                        {
                            key: 'verification_status',
                            label: 'Verification Status',
                            type: 'badge',

                            badgeVariants: {
                                verified: 'success',
                                pending: 'warning',
                                rejected: 'danger',
                            },
                        },

                        {
                            key: 'status',
                            label: 'Account Status',
                            type: 'badge',

                            badgeVariants: {
                                active: 'success',
                                pending: 'warning',
                            },
                        },
                    ],
                },

                {
                    id: 'contact-information',

                    title: 'Contact Information',

                    fields: [
                        {
                            key: 'email',
                            label: 'Company Email',
                            type: 'text',
                        },

                        {
                            key: 'phone',
                            label: 'Phone',
                            type: 'text',
                        },

                        {
                            key: 'alternative_phone',
                            label: 'Alternative Phone',
                            type: 'text',
                        },

                        {
                            key: 'website',
                            label: 'Website',
                            type: 'text',
                        },

                        {
                            key: 'contact_person',
                            label: 'Contact Person',
                            type: 'text',
                        },

                        {
                            key: 'contact_person_phone',
                            label: 'Contact Person Phone',
                            type: 'text',
                        },

                        {
                            key: 'contact_person_email',
                            label: 'Contact Person Email',
                            type: 'text',
                        },
                    ],
                },

                {
                    id: 'location',

                    title: 'Location',

                    fields: [
                        {
                            key: 'province',
                            label: 'Province',
                            type: 'text',
                        },

                        {
                            key: 'district',
                            label: 'District',
                            type: 'text',
                        },

                        {
                            key: 'city',
                            label: 'City / Town',
                            type: 'text',
                        },

                        {
                            key: 'address',
                            label: 'Physical Address',
                            type: 'text',
                        },

                        {
                            key: 'postal_address',
                            label: 'Postal Address',
                            type: 'text',
                        },
                    ],
                },

                {
                    id: 'financial-information',

                    title: 'Financial Information',

                    fields: [
                        {
                            key: 'account_balance',
                            label: 'Account Balance',
                            type: 'text',
                        },

                        {
                            key: 'credit_limit',
                            label: 'Credit Limit',
                            type: 'text',
                        },

                        {
                            key: 'payment_terms',
                            label: 'Payment Terms',
                            type: 'text',
                        },

                        {
                            key: 'currency',
                            label: 'Currency',
                            type: 'text',
                        },
                    ],
                },

                {
                    id: 'system-information',

                    title: 'System Information',

                    fields: [
                        {
                            key: 'total_stations',
                            label: 'Total Stations',
                            type: 'text',
                        },

                        {
                            key: 'created_at',
                            label: 'Created',
                            type: 'datetime',
                        },

                        {
                            key: 'updated_at',
                            label: 'Last Updated',
                            type: 'datetime',
                        },

                        {
                            key: 'notes',
                            label: 'Notes',
                            type: 'text',
                        },
                    ],
                },
            ],
        },

        {
            id: 'oil-marketing-companies-edit',

            parentId: 'oil-marketing-companies',

            title: 'Edit Oil Marketing Company',

            page_title: 'Edit Oil Marketing Company',

            type: 'edit',

            page_type: 'edit',

            path: '/accounts/oil-marketing-companies/:id/edit',

            route: '/accounts/oil-marketing-companies/:id/edit',

            authentication: {
                required: true,
            },

            permissions: {
                any: ['oil_marketing_companies.update'],
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

export const oilMarketingCompaniesListConfig = validateConfig(
    'oil marketing companies list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const oilMarketingCompaniesCreateConfig = validateConfig(
    'oil marketing companies create page',
    pageConfigSchema,
    oilMarketingCompaniesListConfig.sub_pages?.find(
        (page) => page.type === 'create',
    ),
)

export const oilMarketingCompaniesDetailsConfig = validateConfig(
    'oil marketing companies details page',
    pageConfigSchema,
    oilMarketingCompaniesListConfig.sub_pages?.find(
        (page) => page.type === 'details',
    ),
)

export const oilMarketingCompaniesEditConfig = validateConfig(
    'oil marketing companies edit page',
    pageConfigSchema,
    oilMarketingCompaniesListConfig.sub_pages?.find(
        (page) => page.type === 'edit',
    ),
)