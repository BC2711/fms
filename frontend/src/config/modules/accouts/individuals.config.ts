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
        list: { path: '/accounts/individuals', method: 'GET' },
        item: {
            path: '/accounts/individuals/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/accounts/individuals',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/accounts/individuals/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/accounts/individuals/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/accounts/individuals',
    resetEnabled: true,
    layout: {
        type: 'columns',
        columns: 3,
    },
    fields: [
        {
            name: 'first_name',
            type: 'text',
            label: 'First Name',
            required: true,
        },
        {
            name: 'middle_name',
            type: 'text',
            label: 'Middle Name',
        },
        {
            name: 'last_name',
            type: 'text',
            label: 'Last Name',
            required: true,
        },
        {
            name: 'nationality',
            type: 'text',
            label: 'Nationality',
            default_value: 'Zambian',
        },
        {
            name: 'identification_type',
            type: 'select',
            label: 'Identification Type',
            required: true,
            default_value: 'nrc',
            options: [
                { label: 'NRC', value: 'nrc' },
                { label: 'Passport', value: 'passport' },
                { label: 'Driving Licence', value: 'driving_license' },
            ],
        },
        {
            name: 'identification_number',
            type: 'text',
            label: 'Identification Number',
            required: true,
        },
        {
            name: 'date_of_birth',
            type: 'datetime',
            label: 'Date of Birth',
        },
        {
            name: 'gender',
            type: 'select',
            label: 'Gender',
            options: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
            ],
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
            label: 'Phone Number',
            required: true,
        },
        {
            name: 'alternative_phone',
            type: 'text',
            label: 'Alternative Phone',
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
            label: 'Residential Address',
            rows: 4,
            required: true,
        },
        {
            name: 'account_number',
            type: 'text',
            label: 'Account Number',
        },
        {
            name: 'monthly_fuel_limit',
            type: 'number',
            label: 'Monthly Fuel Limit',
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
                { label: 'Blocked', value: 'blocked' },
            ],
        },
    ],
}

const raw: PageConfig = {
    id: 'individuals',
    title: 'Individuals',
    page_title: 'Individual Accounts',
    description: 'Manage individual fuel account holders.',
    type: 'list',
    page_type: 'list',
    path: '/accounts/individuals',
    route: '/accounts/individuals',
    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total Individuals',
            dataPath: 'statistics.total',
            icon: 'Users',
            format: 'number',
        },
        {
            id: 'active',
            type: 'statistic',
            title: 'Active',
            dataPath: 'statistics.active',
            icon: 'UserCheck',
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
            icon: 'UserX',
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
            placeholder: 'Search name, NRC, phone or account number',
        },
        {
            id: 'verification',
            type: 'select',
            label: 'Verification',
            field: 'verification_status',
            query_parameter: 'verification_status',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Verified', value: 'verified' },
                { label: 'Rejected', value: 'rejected' },
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
            defaultColumn: 'first_name',
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
                id: 'first-name',
                type: 'text',
                header: 'First Name',
                accessor: 'first_name',
                searchable: true,
            },
            {
                id: 'last-name',
                type: 'text',
                header: 'Last Name',
                accessor: 'last_name',
                searchable: true,
            },
            {
                id: 'id-number',
                type: 'text',
                header: 'NRC / ID',
                accessor: 'identification_number',
            },
            {
                id: 'phone',
                type: 'text',
                header: 'Phone',
                accessor: 'phone',
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
                        endpoint: '/api/accounts/individuals/{id}',
                        requires_confirmation: true,
                        confirmation: 'Delete this individual account?',
                        success_message: 'Individual account deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add',
            type: 'navigate',
            label: 'Add Individual',
            icon: 'Plus',
            path: '/accounts/individuals/create',
        },
    ],

    sub_pages: [
        {
            id: 'individuals-create',
            parentId: 'individuals',
            title: 'Add Individual',
            page_title: 'Add Individual',
            type: 'create',
            page_type: 'create',
            path: '/accounts/individuals/create',
            route: '/accounts/individuals/create',
            api,
            form: {
                ...form,
                submitLabel: 'Add Individual',
            },
        },
        {
            id: 'individuals-details',
            parentId: 'individuals',
            title: 'Individual Details',
            page_title: 'Individual Details',
            type: 'details',
            page_type: 'details',
            path: '/accounts/individuals/:id',
            route: '/accounts/individuals/:id',
            api,
            recordIdParam: 'id',

            fields: [
                'first_name',
                'middle_name',
                'last_name',
                'account_number',
                'identification_type',
                'identification_number',
                'date_of_birth',
                'email',
                'phone',
                'province',
                'district',
                'address',
                'account_balance',
                'monthly_fuel_limit',
                'verification_status',
                'status',
            ],

            sections: [
                {
                    id: 'personal',
                    title: 'Personal Information',
                    fields: [
                        { key: 'first_name', label: 'First Name', type: 'text' },
                        { key: 'middle_name', label: 'Middle Name', type: 'text' },
                        { key: 'last_name', label: 'Last Name', type: 'text' },
                        { key: 'identification_type', label: 'ID Type', type: 'text' },
                        { key: 'identification_number', label: 'ID Number', type: 'text' },
                        { key: 'date_of_birth', label: 'Date of Birth', type: 'datetime' },
                    ],
                },
                {
                    id: 'account',
                    title: 'Account Information',
                    fields: [
                        { key: 'account_number', label: 'Account Number', type: 'text' },
                        { key: 'account_balance', label: 'Balance', type: 'number' },
                        { key: 'monthly_fuel_limit', label: 'Monthly Fuel Limit', type: 'number' },
                        { key: 'total_vehicles', label: 'Vehicles', type: 'number' },
                        { key: 'total_cards', label: 'Cards', type: 'number' },
                    ],
                },
            ],
        },
        {
            id: 'individuals-edit',
            parentId: 'individuals',
            title: 'Edit Individual',
            page_title: 'Edit Individual',
            type: 'edit',
            page_type: 'edit',
            path: '/accounts/individuals/:id/edit',
            route: '/accounts/individuals/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const individualsListConfig = validateConfig(
    'individuals list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const individualsCreateConfig = validateConfig(
    'individual create page',
    pageConfigSchema,
    individualsListConfig.sub_pages?.find((page) => page.type === 'create'),
)

export const individualsDetailsConfig = validateConfig(
    'individual details page',
    pageConfigSchema,
    individualsListConfig.sub_pages?.find((page) => page.type === 'details'),
)

export const individualsEditConfig = validateConfig(
    'individual edit page',
    pageConfigSchema,
    individualsListConfig.sub_pages?.find((page) => page.type === 'edit'),
)