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
            path: '/stations/station-types',
            method: 'GET',
        },
        item: {
            path: '/stations/station-types/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/stations/station-types',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/stations/station-types/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/stations/station-types/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/stations/station-types',
    resetEnabled: true,
    layout: {
        type: 'columns',
        columns: 2,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'Station Type Name',
            required: true,
            validation: {
                min_length: 2,
                max_length: 100,
            },
        },
        {
            name: 'code',
            type: 'text',
            label: 'Code',
            required: true,
            validation: {
                max_length: 30,
            },
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Description',
            rows: 4,
        },
        {
            name: 'status',
            type: 'select',
            label: 'Status',
            required: true,
            default_value: 'active',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
            ],
        },
        {
            name: 'is_public',
            type: 'checkbox',
            label: 'Public Station Type',
            default_value: true,
        },
    ],
}

const raw: PageConfig = {
    id: 'station-types',
    title: 'Station Types',
    page_title: 'Station Types',
    description: 'Manage station classifications and categories.',
    type: 'list',
    page_type: 'list',
    path: '/stations/station-types',
    route: '/stations/station-types',

    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total Types',
            dataPath: 'statistics.total',
            icon: 'Tags',
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
            id: 'inactive',
            type: 'statistic',
            title: 'Inactive',
            dataPath: 'statistics.inactive',
            icon: 'CircleX',
            format: 'number',
        },
        {
            id: 'stations',
            type: 'statistic',
            title: 'Assigned Stations',
            dataPath: 'statistics.stations',
            icon: 'MapPin',
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
            placeholder: 'Search type name or code',
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
                id: 'code',
                type: 'text',
                header: 'Code',
                accessor: 'code',
                sortable: true,
            },
            {
                id: 'name',
                type: 'text',
                header: 'Station Type',
                accessor: 'name',
                sortable: true,
                searchable: true,
            },
            {
                id: 'description',
                type: 'text',
                header: 'Description',
                accessor: 'description',
            },
            {
                id: 'total-stations',
                type: 'number',
                header: 'Stations',
                accessor: 'total_stations',
            },
            {
                id: 'status',
                type: 'badge',
                header: 'Status',
                accessor: 'status',
                options: {
                    active: 'success',
                    inactive: 'warning',
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
                        path: '/stations/station-types/{id}',
                    },
                    {
                        id: 'edit',
                        type: 'edit',
                        label: 'Edit',
                        icon: 'Pencil',
                        path: '/stations/station-types/{id}/edit',
                    },
                    {
                        id: 'delete',
                        type: 'delete',
                        label: 'Delete',
                        icon: 'Trash2',
                        endpoint: '/api/stations/station-types/{id}',
                        requires_confirmation: true,
                        confirmation:
                            'Delete this station type?',
                        success_message:
                            'Station type deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add',
            type: 'navigate',
            label: 'Add Station Type',
            icon: 'Plus',
            path: '/stations/station-types/create',
        },
    ],

    sub_pages: [
        {
            id: 'station-types-create',
            parentId: 'station-types',
            title: 'Add Station Type',
            page_title: 'Add Station Type',
            type: 'create',
            page_type: 'create',
            path: '/stations/station-types/create',
            route: '/stations/station-types/create',
            api,
            form: {
                ...form,
                submitLabel: 'Add Station Type',
            },
        },
        {
            id: 'station-types-details',
            parentId: 'station-types',
            title: 'Station Type Details',
            page_title: 'Station Type Details',
            type: 'details',
            page_type: 'details',
            path: '/stations/station-types/:id',
            route: '/stations/station-types/:id',
            api,
            recordIdParam: 'id',
            fields: [
                'name',
                'code',
                'description',
                'total_stations',
                'status',
            ],
        },
        {
            id: 'station-types-edit',
            parentId: 'station-types',
            title: 'Edit Station Type',
            page_title: 'Edit Station Type',
            type: 'edit',
            page_type: 'edit',
            path: '/stations/station-types/:id/edit',
            route: '/stations/station-types/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const stationTypesListConfig = validateConfig(
    'station types list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const stationTypesCreateConfig = validateConfig(
    'station types create page',
    pageConfigSchema,
    stationTypesListConfig.sub_pages?.find(
        (page) => page.type === 'create',
    ),
)

export const stationTypesDetailsConfig = validateConfig(
    'station types details page',
    pageConfigSchema,
    stationTypesListConfig.sub_pages?.find(
        (page) => page.type === 'details',
    ),
)

export const stationTypesEditConfig = validateConfig(
    'station types edit page',
    pageConfigSchema,
    stationTypesListConfig.sub_pages?.find(
        (page) => page.type === 'edit',
    ),
)
