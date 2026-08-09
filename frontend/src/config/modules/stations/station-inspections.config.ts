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
            path: '/stations/station-inspections',
            method: 'GET',
        },
        item: {
            path: '/stations/station-inspections/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/stations/station-inspections',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/stations/station-inspections/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/stations/station-inspections/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/stations/station-inspections',
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
            name: 'inspection_type',
            type: 'select',
            label: 'Inspection Type',
            required: true,
            options: [
                { label: 'Routine', value: 'routine' },
                { label: 'Safety', value: 'safety' },
                {
                    label: 'Regulatory',
                    value: 'regulatory',
                },
                {
                    label: 'Environmental',
                    value: 'environmental',
                },
                {
                    label: 'Equipment',
                    value: 'equipment',
                },
                {
                    label: 'Fuel Quality',
                    value: 'fuel_quality',
                },
                {
                    label: 'Compliance',
                    value: 'compliance',
                },
            ],
        },
        {
            name: 'inspection_date',
            type: 'date',
            label: 'Inspection Date',
            required: true,
        },
        {
            name: 'inspector_name',
            type: 'text',
            label: 'Inspector',
            required: true,
        },
        {
            name: 'inspector_organization',
            type: 'text',
            label: 'Inspector Organization',
        },
        {
            name: 'score',
            type: 'number',
            label: 'Inspection Score',
        },
        {
            name: 'result',
            type: 'select',
            label: 'Result',
            required: true,
            options: [
                { label: 'Pass', value: 'pass' },
                {
                    label: 'Pass With Conditions',
                    value: 'conditional',
                },
                { label: 'Fail', value: 'fail' },
            ],
        },
        {
            name: 'findings',
            type: 'textarea',
            label: 'Findings',
            rows: 5,
        },
        {
            name: 'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 5,
        },
        {
            name: 'corrective_action_required',
            type: 'checkbox',
            label: 'Corrective Action Required',
            default_value: false,
        },
        {
            name: 'corrective_action_due_date',
            type: 'date',
            label: 'Corrective Action Due Date',
        },
        {
            name: 'follow_up_required',
            type: 'checkbox',
            label: 'Follow-up Required',
            default_value: false,
        },
        {
            name: 'follow_up_date',
            type: 'date',
            label: 'Follow-up Date',
        },
        {
            name: 'status',
            type: 'select',
            label: 'Inspection Status',
            required: true,
            default_value: 'completed',
            options: [
                { label: 'Scheduled', value: 'scheduled' },
                {
                    label: 'In Progress',
                    value: 'in_progress',
                },
                { label: 'Completed', value: 'completed' },
                {
                    label: 'Follow-up Required',
                    value: 'follow_up_required',
                },
                { label: 'Closed', value: 'closed' },
            ],
        },
    ],
}

const raw: PageConfig = {
    id: 'station-inspections',
    title: 'Station Inspections',
    page_title: 'Station Inspections',
    description:
        'Manage operational, safety, regulatory and compliance station Inspections.',
    type: 'list',
    page_type: 'list',
    path: '/stations/station-inspections',
    route: '/stations/station-inspections',

    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total station Inspections',
            dataPath: 'statistics.total',
            icon: 'ClipboardCheck',
            format: 'number',
        },
        {
            id: 'passed',
            type: 'statistic',
            title: 'Passed',
            dataPath: 'statistics.passed',
            icon: 'CircleCheck',
            format: 'number',
        },
        {
            id: 'failed',
            type: 'statistic',
            title: 'Failed',
            dataPath: 'statistics.failed',
            icon: 'CircleX',
            format: 'number',
        },
        {
            id: 'follow-up',
            type: 'statistic',
            title: 'Follow-up Required',
            dataPath: 'statistics.follow_up_required',
            icon: 'TriangleAlert',
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
            placeholder: 'Search station or inspector',
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
            id: 'inspection-type',
            type: 'select',
            label: 'Inspection Type',
            field: 'inspection_type',
            query_parameter: 'inspection_type',
            options: [
                { label: 'Routine', value: 'routine' },
                { label: 'Safety', value: 'safety' },
                {
                    label: 'Regulatory',
                    value: 'regulatory',
                },
                {
                    label: 'Environmental',
                    value: 'environmental',
                },
                {
                    label: 'Equipment',
                    value: 'equipment',
                },
                {
                    label: 'Compliance',
                    value: 'compliance',
                },
            ],
        },
        {
            id: 'result',
            type: 'select',
            label: 'Result',
            field: 'result',
            query_parameter: 'result',
            options: [
                { label: 'Pass', value: 'pass' },
                {
                    label: 'Conditional',
                    value: 'conditional',
                },
                { label: 'Fail', value: 'fail' },
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
            defaultColumn: 'inspection_date',
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
                id: 'inspection-type',
                type: 'text',
                header: 'Inspection Type',
                accessor: 'inspection_type',
            },
            {
                id: 'date',
                type: 'datetime',
                header: 'Date',
                accessor: 'inspection_date',
                sortable: true,
            },
            {
                id: 'inspector',
                type: 'text',
                header: 'Inspector',
                accessor: 'inspector_name',
            },
            {
                id: 'score',
                type: 'number',
                header: 'Score',
                accessor: 'score',
            },
            {
                id: 'result',
                type: 'badge',
                header: 'Result',
                accessor: 'result',
                options: {
                    pass: 'success',
                    conditional: 'warning',
                    fail: 'danger',
                },
            },
            {
                id: 'status',
                type: 'badge',
                header: 'Status',
                accessor: 'status',
                options: {
                    scheduled: 'warning',
                    in_progress: 'warning',
                    completed: 'success',
                    follow_up_required: 'warning',
                    closed: 'warning',
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
                            '/api/stations/station-inspections/{id}',
                        requires_confirmation: true,
                        confirmation:
                            'Delete this inspection?',
                        success_message:
                            'Inspection deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add-inspection',
            type: 'navigate',
            label: 'Add Inspection',
            icon: 'Plus',
            path: '/stations/station-inspections/create',
        },
    ],

    sub_pages: [
        {
            id: 'station-inspections-create',
            parentId: 'station-inspections',
            title: 'Add Inspection',
            page_title: 'Add Station Inspection',
            type: 'create',
            page_type: 'create',
            path: '/stations/station-inspections/create',
            route: '/stations/station-inspections/create',
            api,
            form: {
                ...form,
                submitLabel: 'Save Inspection',
            },
        },
        {
            id: 'station-inspections-details',
            parentId: 'station-inspections',
            title: 'Inspection Details',
            page_title: 'Inspection Details',
            type: 'details',
            page_type: 'details',
            path: '/stations/station-inspections/:id',
            route: '/stations/station-inspections/:id',
            api,
            recordIdParam: 'id',
            fields: [
                'station',
                'inspection_type',
                'inspection_date',
                'inspector_name',
                'score',
                'result',
                'findings',
                'recommendations',
                'corrective_action_required',
                'corrective_action_due_date',
                'follow_up_required',
                'follow_up_date',
                'status',
            ],
        },
        {
            id: 'station-inspections-edit',
            parentId: 'station-inspections',
            title: 'Edit Inspection',
            page_title: 'Edit Inspection',
            type: 'edit',
            page_type: 'edit',
            path: '/stations/station-inspections/:id/edit',
            route: '/stations/station-inspections/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const stationInspectionsListConfig = validateConfig(
    'station station-inspections list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const stationInspectionsCreateConfig = validateConfig(
    'station inspection',
    pageConfigSchema,
    stationInspectionsListConfig.sub_pages?.find(
        (page) => page.type === 'create',
    ),
)