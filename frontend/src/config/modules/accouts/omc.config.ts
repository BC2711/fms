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

const stationsApi: ApiConfig = {
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
            path: '/stations?oil_marketing_company_id={id}',
            method: 'GET',
        },
    },
}

const transactionsApi: ApiConfig = {
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
            path: '/accounts/oil-marketing-companies/{id}/transactions',
            method: 'GET',
        },
    },
}

const statementApi: ApiConfig = {
    baseUrl: '/api',
    data_mapping: {
        type: 'item',
        item: 'data',
    },
    endpoints: {
        item: {
            path: '/accounts/oil-marketing-companies/{id}/statement',
            method: 'GET',
            responseMappingPath: 'data',
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
    description: 'Manage registered oil marketing companies, licences, stations, account balances, verification and operational status.',
    type: 'list',
    page_type: 'list',
    path: '/accounts/oil-marketing-companies',
    route: '/accounts/oil-marketing-companies',
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
            placeholder: 'Search company name, code, account number, TPIN or licence',
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
            options: [],
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
                        path: '/accounts/oil-marketing-companies/{id}/edit',
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
                        endpoint: '/api/accounts/oil-marketing-companies/{id}',
                        requires_confirmation: true,
                        confirmation: 'Are you sure you want to delete this oil marketing company?',
                        success_message: 'Oil marketing company deleted successfully.',
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
            description: 'Register a new oil marketing company in the fuel management system.',
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
                    path: '/accounts/oil-marketing-companies/{id}/edit',
                },

                {
                    id: 'stations',
                    type: 'navigate',
                    label: 'View Stations',
                    icon: 'MapPin',
                    path: '/accounts/oil-marketing-companies/{id}/stations',
                },

                {
                    id: 'statement',
                    type: 'navigate',
                    label: 'Account Statement',
                    icon: 'FileText',
                    path: '/accounts/oil-marketing-companies/{id}/statement',
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
            title: 'Edit OMC',
            page_title: 'Edit OMC',
            type: 'edit',
            page_type: 'edit',
            path: '/accounts/oil-marketing-companies/:id/edit',
            route: '/accounts/oil-marketing-companies/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
        {
            id: 'oil-marketing-companies-stations',
            parentId: 'oil-marketing-companies',
            title: 'OMC Stations',
            page_title: 'OMC Stations',
            type: 'list',
            page_type: 'list',
            path: '/accounts/oil-marketing-companies/:id/stations',
            route: '/accounts/oil-marketing-companies/:id/stations',
            api: stationsApi,
            statistics: [
                {
                    id: 'total-stations',
                    type: 'statistic',
                    title: 'Total Stations',
                    dataPath: 'statistics.total',
                    icon: 'MapPin',
                    format: 'number',
                },
                {
                    id: 'active-stations',
                    type: 'statistic',
                    title: 'Active',
                    dataPath: 'statistics.active',
                    icon: 'CircleCheck',
                    format: 'number',
                },
                {
                    id: 'inactive-stations',
                    type: 'statistic',
                    title: 'Inactive',
                    dataPath: 'statistics.inactive',
                    icon: 'CircleX',
                    format: 'number',
                },
                {
                    id: 'maintenance',
                    type: 'statistic',
                    title: 'Under Maintenance',
                    dataPath: 'statistics.under_maintenance',
                    icon: 'Wrench',
                    format: 'number',
                },
            ],
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to OMCs',
                    path: '/accounts/oil-marketing-companies',
                }
            ],
            filters: [
                {
                    id: 'search',
                    type: 'search',
                    label: 'Search',
                    field: 'search',
                    query_parameter: 'search',
                    placeholder:
                        'Search station name, code, licence or OMC',
                },
                {
                    id: 'station-type',
                    type: 'select',
                    label: 'Station Type',
                    field: 'station_type_id',
                    query_parameter: 'station_type_id',
                    options: [],
                },
                {
                    id: 'province',
                    type: 'select',
                    label: 'Province',
                    field: 'province_id',
                    query_parameter: 'province_id',
                    options: [],
                },
                {
                    id: 'status',
                    type: 'select',
                    label: 'Status',
                    field: 'status',
                    query_parameter: 'status',
                    options: [
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                        {
                            label: 'Temporarily Closed',
                            value: 'temporarily_closed',
                        },
                        { label: 'Suspended', value: 'suspended' },
                        {
                            label: 'Under Maintenance',
                            value: 'under_maintenance',
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
                        header: 'Station',
                        accessor: 'name',
                        sortable: true,
                        searchable: true,
                    },
                    {
                        id: 'station-type',
                        type: 'text',
                        header: 'Type',
                        accessor: 'station_type.name',
                    },
                    {
                        id: 'province',
                        type: 'text',
                        header: 'Province',
                        accessor: 'province.name',
                        sortable: true,
                    },
                    {
                        id: 'district',
                        type: 'text',
                        header: 'District',
                        accessor: 'district.name',
                    },
                    {
                        id: 'tanks',
                        type: 'number',
                        header: 'Tanks',
                        accessor: 'total_tanks',
                    },
                    {
                        id: 'pumps',
                        type: 'number',
                        header: 'Pumps',
                        accessor: 'total_pumps',
                    },
                    {
                        id: 'attendants',
                        type: 'number',
                        header: 'Attendants',
                        accessor: 'total_attendants',
                    },
                    {
                        id: 'status',
                        type: 'badge',
                        header: 'Status',
                        accessor: 'status',
                        sortable: true,
                        options: {
                            active: 'success',
                            inactive: 'warning',
                            temporarily_closed: 'warning',
                            suspended: 'danger',
                            under_maintenance: 'warning',
                        },
                    },
                    {
                        id: 'created',
                        type: 'datetime',
                        header: 'Created',
                        accessor: 'created_at',
                        sortable: true,
                    },
                ],
            },
        },
        {
            id: 'oil-marketing-companies-transactions',
            parentId: 'oil-marketing-companies',
            title: 'OMC Transactions',
            page_title: 'OMC Transactions',
            type: 'list',
            page_type: 'list',
            path: '/accounts/oil-marketing-companies/:id/transactions',
            route: '/accounts/oil-marketing-companies/:id/transactions',
            api: transactionsApi,
            statistics: [
                {
                    id: 'total-transactions',
                    type: 'statistic',
                    title: 'Total Transactions',
                    dataPath: 'statistics.total',
                    icon: 'Receipt',
                    format: 'number',
                },
                {
                    id: 'successful-transactions',
                    type: 'statistic',
                    title: 'Successful Transactions',
                    dataPath: 'statistics.successful',
                    icon: 'CircleCheck',
                    format: 'number',
                },
                {
                    id: 'failed-transactions',
                    type: 'statistic',
                    title: 'Failed Transactions',
                    dataPath: 'statistics.failed',
                    icon: 'CircleX',
                    format: 'number',
                },
            ],
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to OMCs',
                    path: '/accounts/oil-marketing-companies',
                },
            ],
            filters: [
                {
                    id: 'search',
                    type: 'search',
                    label: 'Search',
                    field: 'search',
                    query_parameter: 'search',
                    placeholder: 'Search reference, station or customer',
                },
                {
                    id: 'transaction-type',
                    type: 'select',
                    label: 'Transaction Type',
                    field: 'transaction_type',
                    query_parameter: 'transaction_type',
                    options: [
                        { label: 'Sale', value: 'sale' },
                        { label: 'Payment', value: 'payment' },
                        { label: 'Refund', value: 'refund' },
                        { label: 'Adjustment', value: 'adjustment' },
                    ],
                },
                {
                    id: 'transaction-date',
                    type: 'date_range',
                    label: 'Transaction Date',
                    fromField: 'date_from',
                    toField: 'date_to',
                    from_query_parameter: 'date_from',
                    to_query_parameter: 'date_to',
                },
                {
                    id: 'status',
                    type: 'select',
                    label: 'Status',
                    field: 'status',
                    query_parameter: 'status',
                    options: [
                        { label: 'Successful', value: 'successful' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Failed', value: 'failed' },
                        { label: 'Reversed', value: 'reversed' },
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
                    defaultColumn: 'transaction_date',
                    defaultDirection: 'desc',
                },
                columns: [
                    {
                        id: 'reference',
                        type: 'text',
                        header: 'Reference',
                        accessor: 'reference',
                        sortable: true,
                        searchable: true,
                    },
                    {
                        id: 'transaction-date',
                        type: 'datetime',
                        header: 'Date',
                        accessor: 'transaction_date',
                        sortable: true,
                    },
                    {
                        id: 'transaction-type',
                        type: 'text',
                        header: 'Type',
                        accessor: 'transaction_type',
                        sortable: true,
                    },
                    {
                        id: 'station',
                        type: 'text',
                        header: 'Station',
                        accessor: 'station.name',
                    },
                    {
                        id: 'customer',
                        type: 'text',
                        header: 'Customer',
                        accessor: 'customer_name',
                    },
                    {
                        id: 'amount',
                        type: 'number',
                        header: 'Amount',
                        accessor: 'amount',
                        sortable: true,
                        format: 'currency',
                        currency: 'ZMW',
                    },
                    {
                        id: 'status',
                        type: 'badge',
                        header: 'Status',
                        accessor: 'status',
                        sortable: true,
                        options: {
                            successful: 'success',
                            pending: 'warning',
                            failed: 'danger',
                            reversed: 'info',
                        },
                    },
                ],
            },
        },
        {
            id: 'oil-marketing-companies-statement',
            parentId: 'oil-marketing-companies',
            title: 'OMC Account Statement',
            page_title: 'OMC Account Statement',
            description: 'Review the company account balance and statement summary.',
            type: 'details',
            page_type: 'details',
            path: '/accounts/oil-marketing-companies/:id/statement',
            route: '/accounts/oil-marketing-companies/:id/statement',
            api: statementApi,
            recordIdParam: 'id',
            fields: [
                'account_number',
                'company_name',
                'opening_balance',
                'total_debits',
                'total_credits',
                'closing_balance',
                'currency',
            ],
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to OMCs',
                    path: '/accounts/oil-marketing-companies',
                    variant: 'secondary',
                },
            ],
            sections: [
                {
                    id: 'statement-summary',
                    title: 'Statement Summary',
                    fields: [
                        { key: 'account_number', label: 'Account Number', type: 'text', copyable: true },
                        { key: 'company_name', label: 'Company', type: 'text' },
                        { key: 'opening_balance', label: 'Opening Balance', type: 'number' },
                        { key: 'total_debits', label: 'Total Debits', type: 'number' },
                        { key: 'total_credits', label: 'Total Credits', type: 'number' },
                        { key: 'closing_balance', label: 'Closing Balance', type: 'number' },
                        { key: 'currency', label: 'Currency', type: 'text' },
                    ],
                },
            ],
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

export const oilMarketingCompaniesStationsConfig = validateConfig(
    'oil marketing companies stations page',
    pageConfigSchema,
    oilMarketingCompaniesListConfig.sub_pages?.find(
        (page) => page.id === 'oil-marketing-companies-stations',
    ),
) as ListPageConfig

export const oilMarketingCompaniesTransactionsConfig = validateConfig(
    'oil marketing companies transactions page',
    pageConfigSchema,
    oilMarketingCompaniesListConfig.sub_pages?.find(
        (page) => page.id === 'oil-marketing-companies-transactions',
    ),
) as ListPageConfig

export const oilMarketingCompaniesStatementConfig = validateConfig(
    'oil marketing companies statement page',
    pageConfigSchema,
    oilMarketingCompaniesListConfig.sub_pages?.find(
        (page) => page.id === 'oil-marketing-companies-statement',
    ),
)
