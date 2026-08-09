import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'

import type {
    ApiConfig,
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
            path: '/stations/station-performance',
            method: 'GET',
        },
        item: {
            path: '/stations/station-performance/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
    },
}

const raw: PageConfig = {
    id: 'station-performance',

    title: 'Station Performance',

    page_title: 'Station Performance',

    description:
        'Monitor station sales, fuel volumes, transactions, stock variance and operational station-performance.',

    type: 'list',
    page_type: 'list',

    path: '/stations/station-performance',
    route: '/stations/station-performance',

    api,

    statistics: [
        {
            id: 'total-sales',
            type: 'statistic',
            title: 'Total Sales',
            dataPath: 'statistics.total_sales',
            icon: 'Banknote',
            format: 'currency',
        },
        {
            id: 'fuel-volume',
            type: 'statistic',
            title: 'Fuel Volume',
            dataPath: 'statistics.total_volume',
            icon: 'Fuel',
            format: 'number',
        },
        {
            id: 'transactions',
            type: 'statistic',
            title: 'Transactions',
            dataPath: 'statistics.total_transactions',
            icon: 'Receipt',
            format: 'number',
        },
        {
            id: 'average-station-performance',
            type: 'statistic',
            title: 'Average Score',
            dataPath: 'statistics.average_score',
            icon: 'Gauge',
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
            placeholder: 'Search station',
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
            id: 'omc',
            type: 'select',
            label: 'Oil Marketing Company',
            field: 'oil_marketing_company_id',
            query_parameter: 'oil_marketing_company_id',
            options: [],
        },
        {
            id: 'period',
            type: 'select',
            label: 'Period',
            field: 'period',
            query_parameter: 'period',
            options: [
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'This Quarter', value: 'quarter' },
                { label: 'This Year', value: 'year' },
            ],
        },
    ],

    table: {
        rowKey: 'station_id',
        stickyHeader: true,
        striped: true,

        pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50],
        },

        sorting: {
            enabled: true,
            defaultColumn: 'total_sales',
            defaultDirection: 'desc',
        },

        columns: [
            {
                id: 'station',
                type: 'text',
                header: 'Station',
                accessor: 'station_name',
                searchable: true,
                sortable: true,
            },
            {
                id: 'omc',
                type: 'text',
                header: 'OMC',
                accessor: 'oil_marketing_company_name',
            },
            {
                id: 'sales',
                type: 'number',
                header: 'Sales',
                accessor: 'total_sales',
                sortable: true,
            },
            {
                id: 'volume',
                type: 'number',
                header: 'Litres Sold',
                accessor: 'total_volume',
                sortable: true,
            },
            {
                id: 'transactions',
                type: 'number',
                header: 'Transactions',
                accessor: 'total_transactions',
                sortable: true,
            },
            {
                id: 'variance',
                type: 'number',
                header: 'Stock Variance',
                accessor: 'stock_variance',
                sortable: true,
            },
            {
                id: 'uptime',
                type: 'number',
                header: 'Uptime %',
                accessor: 'uptime_percentage',
            },
            {
                id: 'score',
                type: 'number',
                header: 'Score',
                accessor: 'station-performance_score',
                sortable: true,
            },
            {
                id: 'rating',
                type: 'badge',
                header: 'Rating',
                accessor: 'rating',
                options: {
                    excellent: 'success',
                    good: 'success',
                    average: 'warning',
                    poor: 'danger',
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
                        label: 'View station-performance',
                        icon: 'ChartNoAxesCombined',
                    },
                ],
            },
        ],
    },

    sub_pages: [
        {
            id: 'station-performance-details',
            parentId: 'station-performance',

            title: 'Station station-performance Details',

            page_title: 'Station station-performance Details',

            type: 'details',
            page_type: 'details',

            path: '/stations/station-performance/:id',
            route: '/stations/station-performance/:id',

            api,

            recordIdParam: 'id',

            fields: [
                'station_name',
                'total_sales',
                'total_volume',
                'total_transactions',
                'average_transaction',
                'stock_variance',
                'uptime_percentage',
                'station-performance_score',
                'rating',
            ],

            sections: [
                {
                    id: 'sales',
                    title: 'Sales station-performance',
                    fields: [
                        {
                            key: 'total_sales',
                            label: 'Total Sales',
                            type: 'number',
                        },
                        {
                            key: 'total_volume',
                            label: 'Fuel Sold',
                            type: 'number',
                        },
                        {
                            key: 'total_transactions',
                            label: 'Transactions',
                            type: 'number',
                        },
                        {
                            key: 'average_transaction',
                            label: 'Average Transaction',
                            type: 'number',
                        },
                    ],
                },
                {
                    id: 'operations',
                    title: 'Operational station-performance',
                    fields: [
                        {
                            key: 'stock_variance',
                            label: 'Stock Variance',
                            type: 'number',
                        },
                        {
                            key: 'uptime_percentage',
                            label: 'Uptime',
                            type: 'number',
                        },
                        {
                            key: 'station-performance_score',
                            label: 'station-performance Score',
                            type: 'number',
                        },
                        {
                            key: 'rating',
                            label: 'Rating',
                            type: 'badge',
                            badgeVariants: {
                                excellent: 'success',
                                good: 'success',
                                average: 'warning',
                                poor: 'danger',
                            },
                        },
                    ],
                },
            ],
        },
    ],
}

export const stationPerformanceListConfig = validateConfig(
    'station station-performance list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const stationPerformanceDetailsConfig = validateConfig(
    'station station-performance details page',
    pageConfigSchema,
    stationPerformanceListConfig.sub_pages?.find(
        (page) => page.type === 'details',
    ),
)