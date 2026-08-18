import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'

import type {
    ApiConfig,
    FormConfig,
    ListPageConfig,
    PageConfig,
} from '@/types/configuration.types'

const baseUrl = import.meta.env.VITE_API_URL;
const individualUrl = import.meta.env.VITE_API_ROUTE_INDIVIDUALS;
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

const vehiclesApi: ApiConfig = {
    baseUrl: `${baseUrl}`,
    data_mapping: {
        type: 'paginated',
        items: 'data.items',
        total: 'data.total',
        page: 'data.page',
        pageSize: 'data.pageSize',
    },
    endpoints: {
        list: {
            path: `${individualUrl}/{id}/vehicles`,
            method: 'GET',
        },
    },
}

const transactionsApi: ApiConfig = {
    baseUrl: `${baseUrl}`,
    data_mapping: {
        type: 'paginated',
        items: 'data.items',
        total: 'data.total',
        page: 'data.page',
        pageSize: 'data.pageSize',
    },
    endpoints: {
        list: {
            path: `${individualUrl}/{id}/transactions`,
            method: 'GET',
        },
    },
}

const form: FormConfig = {
    cancelPath: `${individualUrl}`,
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
    path: `${individualUrl}`,
    route: `${individualUrl}`,
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
                        path: `${individualUrl}/{id}`,
                    },
                    {
                        id: 'edit',
                        type: 'edit',
                        label: 'Edit',
                        icon: 'Pencil',
                        path: `${individualUrl}/{id}/edit`,
                    },
                    {
                        id: 'vehicles',
                        type: 'navigate',
                        label: 'Vehicles',
                        icon: 'Car',
                        path: `${individualUrl}/{id}/vehicles`,
                    },
                    {
                        id: 'transactions',
                        type: 'navigate',
                        label: 'Transactions',
                        icon: 'List',
                        path: `${individualUrl}/{id}/transactions`,
                    },
                    {
                        id: 'delete',
                        type: 'delete',
                        label: 'Delete',
                        icon: 'Trash2',
                        endpoint: `${baseUrl}/${individualUrl}/{id}`,
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
            path: `${individualUrl}/create`,
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
            path: `${individualUrl}/create`,
            route: `${individualUrl}/create`,
            api,
            form: {
                ...form,
                submitLabel: 'Add Individual',
            },
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Individuals',
                    path: `${individualUrl}`,
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
        },
        {
            id: 'individuals-details',
            parentId: 'individuals',
            title: 'Individual Details',
            page_title: 'Individual Details',
            type: 'details',
            page_type: 'details',
            path: `${individualUrl}/:id`,
            route: `${individualUrl}/:id`,
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
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Individuals',
                    path: `${individualUrl}`,
                    icon: 'ArrowLeft',
                    variant: 'secondary',
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
            path: `${individualUrl}/:id/edit`,
            route: `${individualUrl}/:id/edit`,
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Individuals',
                    path: `${individualUrl}`,
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
        },
        {
            id: 'individuals-vehicles',
            parentId: 'individuals',
            title: 'Individual Vehicles',
            page_title: 'Registered Vehicles',
            description: 'View vehicles registered to this individual account.',
            type: 'list',
            page_type: 'list',
            path: `${individualUrl}/:id/vehicles`,
            route: `${individualUrl}/:id/vehicles`,
            api: vehiclesApi,
            statistics: [
                {
                    id: 'total-vehicles',
                    type: 'statistic',
                    title: 'Total Vehicles',
                    dataPath: 'statistics.total',
                    icon: 'Car',
                    format: 'number',
                },
                {
                    id: 'active-vehicles',
                    type: 'statistic',
                    title: 'Active',
                    dataPath: 'statistics.active',
                    icon: 'CircleCheck',
                    format: 'number',
                },
                {
                    id: 'inactive-vehicles',
                    type: 'statistic',
                    title: 'Inactive',
                    dataPath: 'statistics.inactive',
                    icon: 'CircleX',
                    format: 'number',
                },
                {
                    id: 'fuel-cards',
                    type: 'statistic',
                    title: 'Assigned Fuel Cards',
                    dataPath: 'statistics.assigned_cards',
                    icon: 'CreditCard',
                    format: 'number',
                },
            ],
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Individuals',
                    path: `${individualUrl}`,
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
            filters: [
                {
                    id: 'search',
                    type: 'search',
                    label: 'Search',
                    field: 'search',
                    query_parameter: 'search',
                    placeholder: 'Search registration, fleet number, make or model',
                },
                {
                    id: 'fuel-type',
                    type: 'select',
                    label: 'Fuel Type',
                    field: 'fuel_type',
                    query_parameter: 'fuel_type',
                    options: [
                        { label: 'Petrol', value: 'petrol' },
                        { label: 'Diesel', value: 'diesel' },
                        { label: 'Electric', value: 'electric' },
                        { label: 'Hybrid', value: 'hybrid' },
                    ],
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
                    defaultColumn: 'registration_number',
                    defaultDirection: 'asc',
                },
                columns: [
                    {
                        id: 'registration-number',
                        type: 'text',
                        header: 'Registration No.',
                        accessor: 'registration_number',
                        sortable: true,
                        searchable: true,
                    },
                    {
                        id: 'fleet-number',
                        type: 'text',
                        header: 'Fleet No.',
                        accessor: 'fleet_number',
                        sortable: true,
                    },
                    {
                        id: 'make',
                        type: 'text',
                        header: 'Make',
                        accessor: 'make',
                        sortable: true,
                    },
                    {
                        id: 'model',
                        type: 'text',
                        header: 'Model',
                        accessor: 'model',
                    },
                    {
                        id: 'fuel-type',
                        type: 'text',
                        header: 'Fuel Type',
                        accessor: 'fuel_type',
                    },
                    {
                        id: 'fuel-card',
                        type: 'text',
                        header: 'Fuel Card',
                        accessor: 'fuel_card.card_number',
                    },
                    {
                        id: 'monthly-limit',
                        type: 'number',
                        header: 'Monthly Limit',
                        accessor: 'monthly_limit',
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
                            active: 'success',
                            inactive: 'warning',
                            suspended: 'danger',
                        },
                    },
                    {
                        id: 'created-at',
                        type: 'datetime',
                        header: 'Created',
                        accessor: 'created_at',
                        sortable: true,
                    },
                ],
            },
        },
        {
            id: 'individuals-transactions',
            parentId: 'individuals',
            title: 'Individual Transactions',
            page_title: 'Individual Transactions',
            description: 'Review fuel and account transactions for this individual.',
            type: 'list',
            page_type: 'list',
            path: `${individualUrl}/:id/transactions`,
            route: `${individualUrl}/:id/transactions`,
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
                    title: 'Successful',
                    dataPath: 'statistics.successful',
                    icon: 'CircleCheck',
                    format: 'number',
                },
                {
                    id: 'failed-transactions',
                    type: 'statistic',
                    title: 'Failed',
                    dataPath: 'statistics.failed',
                    icon: 'CircleX',
                    format: 'number',
                },
            ],
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Individuals',
                    path: `${individualUrl}`,
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
            filters: [
                {
                    id: 'search',
                    type: 'search',
                    label: 'Search',
                    field: 'search',
                    query_parameter: 'search',
                    placeholder: 'Search reference, vehicle, card or station',
                },
                {
                    id: 'transaction-type',
                    type: 'select',
                    label: 'Transaction Type',
                    field: 'transaction_type',
                    query_parameter: 'transaction_type',
                    options: [
                        { label: 'Fuel Purchase', value: 'fuel_purchase' },
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
                        id: 'vehicle',
                        type: 'text',
                        header: 'Vehicle',
                        accessor: 'vehicle.registration_number',
                    },
                    {
                        id: 'station',
                        type: 'text',
                        header: 'Station',
                        accessor: 'station.name',
                    },
                    {
                        id: 'quantity',
                        type: 'number',
                        header: 'Quantity',
                        accessor: 'quantity',
                        sortable: true,
                        format: 'decimal',
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