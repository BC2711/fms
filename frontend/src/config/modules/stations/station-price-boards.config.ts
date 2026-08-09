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
            path: '/stations/station-price-boards',
            method: 'GET',
        },
        item: {
            path: '/stations/station-price-boards/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/stations/station-price-boards',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/stations/station-price-boards/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/stations/station-price-boards/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/stations/station-price-boards',
    resetEnabled: true,
    layout: {
        type: 'columns',
        columns: 3
    },
    fields: [
        {
            name: 'station_id',
            type: 'select',
            label: 'Station',
            required: true,
            options: [],
        },
        {
            name: 'product_id',
            type: 'select',
            label: 'Fuel Product',
            required: true,
            options: [],
        },
        {
            name: 'selling_price',
            type: 'number',
            label: 'Selling Price',
            required: true,
        },
        {
            name: 'currency',
            type: 'select',
            label: 'Currency',
            required: true,
            default_value: 'ZMW',
            options: [
                {
                    label: 'Zambian Kwacha',
                    value: 'ZMW',
                },
            ],
        },
        {
            name: 'effective_date',
            type: 'date',
            label: 'Effective Date',
            required: true,
        },
        {
            name: 'effective_time',
            type: 'time',
            label: 'Effective Time',
        },
        {
            name: 'approval_status',
            type: 'select',
            label: 'Approval Status',
            default_value: 'pending',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
            ],
        },
        {
            name: 'status',
            type: 'select',
            label: 'Price Status',
            default_value: 'scheduled',
            required: true,
            options: [
                { label: 'Scheduled', value: 'scheduled' },
                { label: 'Active', value: 'active' },
                { label: 'Expired', value: 'expired' },
                { label: 'Cancelled', value: 'cancelled' },
            ],
        },
        {
            name: 'notes',
            type: 'textarea',
            label: 'Notes',
            rows: 3,
        },
    ],
}

const raw: PageConfig = {
    id: 'station-price-boards',
    title: 'Station Price Boards',
    page_title: 'Station Price Boards',
    description:
        'Manage fuel selling prices displayed and applied at each station.',
    type: 'list',
    page_type: 'list',
    path: '/stations/station-price-boards',
    route: '/stations/station-price-boards',

    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Price Records',
            dataPath: 'statistics.total',
            icon: 'BadgeDollarSign',
            format: 'number',
        },
        {
            id: 'active',
            type: 'statistic',
            title: 'Active Prices',
            dataPath: 'statistics.active',
            icon: 'CircleCheck',
            format: 'number',
        },
        {
            id: 'scheduled',
            type: 'statistic',
            title: 'Scheduled',
            dataPath: 'statistics.scheduled',
            icon: 'Clock',
            format: 'number',
        },
        {
            id: 'pending',
            type: 'statistic',
            title: 'Pending Approval',
            dataPath: 'statistics.pending_approval',
            icon: 'ClipboardClock',
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
            placeholder: 'Search station or product',
        },
        {
            id: 'station',
            type: 'select',
            label: 'Station',
            field: 'station_id',
            query_parameter: 'station_id',
            options: [],
        },
        {
            id: 'product',
            type: 'select',
            label: 'Product',
            field: 'product_id',
            query_parameter: 'product_id',
            options: [],
        },
        {
            id: 'status',
            type: 'select',
            label: 'Status',
            field: 'status',
            query_parameter: 'status',
            options: [
                { label: 'Scheduled', value: 'scheduled' },
                { label: 'Active', value: 'active' },
                { label: 'Expired', value: 'expired' },
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
            defaultColumn: 'effective_date',
            defaultDirection: 'desc',
        },

        columns: [
            {
                id: 'station',
                type: 'text',
                header: 'Station',
                accessor: 'station.name',
                searchable: true,
            },
            {
                id: 'product',
                type: 'text',
                header: 'Product',
                accessor: 'product.name',
            },
            {
                id: 'selling-price',
                type: 'number',
                header: 'Price',
                accessor: 'selling_price',
                sortable: true,
            },
            {
                id: 'effective-date',
                type: 'datetime',
                header: 'Effective',
                accessor: 'effective_at',
                sortable: true,
            },
            {
                id: 'approval',
                type: 'badge',
                header: 'Approval',
                accessor: 'approval_status',
                options: {
                    approved: 'success',
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
                    scheduled: 'warning',
                    active: 'success',
                    expired: 'warning',
                    cancelled: 'danger',
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
                        endpoint:
                            '/api/stations/station-price-boards/{id}',
                        requires_confirmation: true,
                        confirmation:
                            'Delete this station price record?',
                        success_message:
                            'Station price record deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add-price',
            type: 'navigate',
            label: 'Add Price',
            icon: 'Plus',
            path: '/stations/station-price-boards/create',
        },
    ],

    sub_pages: [
        {
            id: 'station-price-boards-create',
            parentId: 'station-price-boards',
            title: 'Add Station Price',
            page_title: 'Add Station Price',
            type: 'create',
            page_type: 'create',
            path: '/stations/station-price-boards/create',
            route: '/stations/station-price-boards/create',
            api,
            form: {
                ...form,
                submitLabel: 'Add Price',
            },
        },
        {
            id: 'station-price-boards-details',
            parentId: 'station-price-boards',
            title: 'Price Details',
            page_title: 'Station Price Details',
            type: 'details',
            page_type: 'details',
            path: '/stations/station-price-boards/:id',
            route: '/stations/station-price-boards/:id',
            api,
            recordIdParam: 'id',
            fields: [
                'station',
                'product',
                'selling_price',
                'currency',
                'effective_at',
                'approval_status',
                'status',
                'notes',
            ],
        },
        {
            id: 'station-price-boards-edit',
            parentId: 'station-price-boards',
            title: 'Edit Price',
            page_title: 'Edit Station Price',
            type: 'edit',
            page_type: 'edit',
            path: '/stations/station-price-boards/:id/edit',
            route: '/stations/station-price-boards/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const stationPriceBoardsListConfig = validateConfig(
    'station price boards list page',
    pageConfigSchema,
    raw,
) as ListPageConfig
export const stationsPriceBoardsCreateConfig = validateConfig(
    'stations create page',
    pageConfigSchema,
    stationPriceBoardsListConfig.sub_pages?.find(
        (page) => page.type === 'create',
    ),
)