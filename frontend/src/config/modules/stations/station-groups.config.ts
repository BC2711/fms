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
            path: '/stations/station-groups',
            method: 'GET',
        },
        item: {
            path: '/stations/station-groups/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/stations/station-groups',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/stations/station-groups/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/stations/station-groups/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/stations/station-groups',
    resetEnabled: true,
    layout: {
        type: 'columns',
        columns: 3,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'Group Name',
            required: true,
        },
        {
            name: 'code',
            type: 'text',
            label: 'Group Code',
            required: true,
        },
        {
            name: 'oil_marketing_company_id',
            type: 'select',
            label: 'Oil Marketing Company',
            options: [],
        },
        {
            name: 'manager_name',
            type: 'text',
            label: 'Group Manager',
        },
        {
            name: 'manager_phone',
            type: 'text',
            label: 'Manager Phone',
        },
        {
            name: 'manager_email',
            type: 'email',
            label: 'Manager Email',
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
    ],
}

const raw: PageConfig = {
    id: 'station-groups',
    title: 'Station Groups',
    page_title: 'Station Groups',
    description: 'Manage station networks and station groupings.',
    type: 'list',
    page_type: 'list',
    path: '/stations/station-groups',
    route: '/stations/station-groups',

    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total Station Groups',
            dataPath: 'statistics.total',
            icon: 'Layers3',
            format: 'number',
        },
        {
            id: 'active',
            type: 'statistic',
            title: 'Active Station Groups',
            dataPath: 'statistics.active',
            icon: 'CircleCheck',
            format: 'number',
        },
        {
            id: 'stations',
            type: 'statistic',
            title: 'Grouped Stations',
            dataPath: 'statistics.stations',
            icon: 'MapPin',
            format: 'number',
        },
        {
            id: 'ungrouped',
            type: 'statistic',
            title: 'Ungrouped Stations',
            dataPath: 'statistics.ungrouped',
            icon: 'MapPinned',
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
            placeholder: 'Search group name or code',
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
                header: 'Group',
                accessor: 'name',
                sortable: true,
                searchable: true,
            },
            {
                id: 'omc',
                type: 'text',
                header: 'OMC',
                accessor: 'oil_marketing_company.name',
            },
            {
                id: 'manager',
                type: 'text',
                header: 'Manager',
                accessor: 'manager_name',
            },
            {
                id: 'stations',
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
                    },
                    {
                        id: 'stations',
                        type: 'navigate',
                        label: 'View Stations',
                        icon: 'MapPin',
                        path: '/stations?group_id={id}',
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
                        endpoint: '/api/stations/station-groups/{id}',
                        requires_confirmation: true,
                        confirmation:
                            'Delete this station group?',
                        success_message:
                            'Station group deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add',
            type: 'navigate',
            label: 'Add Station Group',
            icon: 'Plus',
            path: '/stations/station-groups/create',
        },
    ],

    sub_pages: [
        {
            id: 'station-station-groups-create',
            parentId: 'station-groups',
            title: 'Add Station Group',
            page_title: 'Add Station Group',
            type: 'create',
            page_type: 'create',
            path: '/stations/station-groups/create',
            route: '/stations/station-groups/create',
            api,
            form: {
                ...form,
                submitLabel: 'Add Station Group',
            },
        },
        {
            id: 'station-station-groups-details',
            parentId: 'station-groups',
            title: 'Station Group Details',
            page_title: 'Station Group Details',
            type: 'details',
            page_type: 'details',
            path: '/stations/station-groups/:id',
            route: '/stations/station-groups/:id',
            api,
            recordIdParam: 'id',
            fields: [
                'name',
                'code',
                'oil_marketing_company',
                'manager_name',
                'manager_phone',
                'manager_email',
                'total_stations',
                'description',
                'status',
            ],
        },
        {
            id: 'station-station-groups-edit',
            parentId: 'station-groups',
            title: 'Edit Station Group',
            page_title: 'Edit Station Group',
            type: 'edit',
            page_type: 'edit',
            path: '/stations/station-groups/:id/edit',
            route: '/stations/station-groups/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const stationGroupsListConfig = validateConfig(
    'station station-groups list page',
    pageConfigSchema,
    raw,
) as ListPageConfig