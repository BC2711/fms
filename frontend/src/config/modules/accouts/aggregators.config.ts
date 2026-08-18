import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'

import type {
    ApiConfig,
    FormConfig,
    ListPageConfig,
    PageConfig,
} from '@/types/configuration.types'

const aggregatorBaseUrl = import.meta.env.VITE_API_ROUTE_AGGREGATORS

const api: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_URL,

    data_mapping: {
        type: 'paginated',
        items: 'data.items',
        total: 'data.total',
        page: 'data.page',
        pageSize: 'data.pageSize',
    },

    endpoints: {
        list: {
            path: aggregatorBaseUrl,
            method: 'GET'
        },
        item: {
            path: `${aggregatorBaseUrl}/{id}`,
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: aggregatorBaseUrl,
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: `${aggregatorBaseUrl}/{id}`,
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: `${aggregatorBaseUrl}/{id}`,
            method: 'DELETE',
        },
    },
}

const vehiclesApi: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_URL,
    data_mapping: {
        type: 'paginated',
        items: 'data.items',
        total: 'data.total',
        page: 'data.page',
        pageSize: 'data.pageSize',
    },
    endpoints: {
        list: {
            path: `${aggregatorBaseUrl}/{id}/vehicles`,
            method: 'GET',
        },
    },
}

const transactionsApi: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_URL,
    data_mapping: {
        type: 'paginated',
        items: 'data.items',
        total: 'data.total',
        page: 'data.page',
        pageSize: 'data.pageSize',
    },
    endpoints: {
        list: {
            path: `${aggregatorBaseUrl}/{id}/transactions`,
            method: 'GET',
        },
    },
}

const form: FormConfig = {
    cancelPath: `${aggregatorBaseUrl}`,
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
    path: aggregatorBaseUrl,
    route: aggregatorBaseUrl,
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
                        path: `${aggregatorBaseUrl}/{id}`,
                    },
                    {
                        id: 'edit',
                        type: 'edit',
                        label: 'Edit',
                        icon: 'Pencil',
                        path: `${aggregatorBaseUrl}/{id}/edit`,
                    },
                    {
                        id: 'vehicles',
                        type: 'navigate',
                        label: 'Vehicles',
                        icon: 'Car',
                        path: `${aggregatorBaseUrl}/{id}/vehicles`,
                    },
                    {
                        id: 'transactions',
                        type: 'navigate',
                        label: 'Transactions',
                        icon: 'Receipt',
                        path: `${aggregatorBaseUrl}/{id}/transactions`,
                    },
                    {
                        id: 'delete',
                        type: 'delete',
                        label: 'Delete',
                        icon: 'Trash2',
                        endpoint: `${aggregatorBaseUrl}/{id}`,
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
            path: `${aggregatorBaseUrl}/create`,
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
            path: `${aggregatorBaseUrl}/create`,
            route: `${aggregatorBaseUrl}/create`,
            api,
            form: {
                ...form,
                submitLabel: 'Add Aggregator',
            },
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Aggregators',
                    path: `${aggregatorBaseUrl}`,
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
        },
        {
            id: 'aggregators-details',
            parentId: 'aggregators',
            title: 'Aggregator Details',
            page_title: 'Aggregator Details',
            type: 'details',
            page_type: 'details',
            path: `${aggregatorBaseUrl}/{id}`,
            route: `${aggregatorBaseUrl}/{id}`,
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
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Aggregators',
                    path: `${aggregatorBaseUrl}`,
                    icon: 'ArrowLeft',
                    variant: 'secondary',
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
            path: `${aggregatorBaseUrl}/{id}/edit`,
            route: `${aggregatorBaseUrl}/{id}/edit`,
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
                    label: 'Back to Aggregators',
                    path: `${aggregatorBaseUrl}`,
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
        },

        {
            id: 'aggregators-vehicles',
            parentId: 'aggregators',
            title: 'Aggregator Vehicles',
            page_title: 'Registered Vehicles',
            description: 'View vehicles registered to this aggregator account.',
            type: 'list',
            page_type: 'list',
            path: `${aggregatorBaseUrl}/{id}/vehicles`,
            route: `${aggregatorBaseUrl}/{id}/vehicles`,
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
                    label: 'Back to Aggregators',
                    path: `${aggregatorBaseUrl}`,
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
            id: 'aggregators-transactions',
            parentId: 'aggregators',
            title: 'Individual Transactions',
            page_title: 'Individual Transactions',
            description: 'Review fuel and account transactions for this individual.',
            type: 'list',
            page_type: 'list',
            path: `${aggregatorBaseUrl}/{id}/transactions`,
            route: `${aggregatorBaseUrl}/{id}/transactions`,
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
                    label: 'Back to aggregators',
                    path: `${aggregatorBaseUrl}`,
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