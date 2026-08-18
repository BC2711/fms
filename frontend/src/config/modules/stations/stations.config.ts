import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'

import type {
    ApiConfig,
    FormConfig,
    ListPageConfig,
    PageConfig,
} from '@/types/configuration.types'

const baseUrl = import.meta.env.VITE_API_URL;
const stationsBaseUrl = import.meta.env.VITE_API_ROUTE_STATIONS;

const api: ApiConfig = {
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
            path: `${stationsBaseUrl}`,
            method: 'GET',
        },
        item: {
            path: `${stationsBaseUrl}/{id}`,
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: `${stationsBaseUrl}`,
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: `${stationsBaseUrl}/{id}`,
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: `${stationsBaseUrl}/{id}`,
            method: 'DELETE',
        },
    },
}

const priceBoardsApi: ApiConfig = {
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
            path: `${stationsBaseUrl}/{id}/price-boards`,
            method: 'GET',
        },
        item: {
            path: `${stationsBaseUrl}/{id}/price-boards/{boardId}`,
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: `${stationsBaseUrl}/{id}/price-boards`,
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: `${stationsBaseUrl}/{id}/price-boards/{boardId}`,
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: `${stationsBaseUrl}/{id}/price-boards/{boardId}`,
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: `${stationsBaseUrl}`,
    resetEnabled: true,

    layout: {
        type: 'columns',
        columns: 3,
    },

    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'Station Name',
            required: true,
            validation: {
                min_length: 2,
                max_length: 150,
            },
        },
        {
            name: 'code',
            type: 'text',
            label: 'Station Code',
            required: true,
            validation: {
                min_length: 2,
                max_length: 30,
            },
        },
        {
            name: 'station_type_id',
            type: 'select',
            label: 'Station Type',
            required: true,
            options: [],
        },
        {
            name: 'station_group_id',
            type: 'select',
            label: 'Station Group',
            options: [],
        },
        {
            name: 'oil_marketing_company_id',
            type: 'select',
            label: 'Oil Marketing Company',
            required: true,
            options: [],
        },
        {
            name: 'license_number',
            type: 'text',
            label: 'ERB Licence Number',
            required: true,
        },
        {
            name: 'license_expiry_date',
            type: 'date',
            label: 'Licence Expiry Date',
            required: true,
        },
        {
            name: 'manager_name',
            type: 'text',
            label: 'Station Manager',
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
            name: 'phone',
            type: 'text',
            label: 'Station Phone',
            required: true,
        },
        {
            name: 'email',
            type: 'email',
            label: 'Station Email',
        },
        {
            name: 'province_id',
            type: 'select',
            label: 'Province',
            required: true,
            options: [],
        },
        {
            name: 'district_id',
            type: 'select',
            label: 'District',
            required: true,
            options: [],
        },
        {
            name: 'city',
            type: 'text',
            label: 'City / Town',
        },
        {
            name: 'address',
            type: 'textarea',
            label: 'Physical Address',
            required: true,
            rows: 4,
        },
        {
            name: 'latitude',
            type: 'number',
            label: 'Latitude',
        },
        {
            name: 'longitude',
            type: 'number',
            label: 'Longitude',
        },
        {
            name: 'operating_hours',
            type: 'text',
            label: 'Operating Hours',
            placeholder: 'e.g. 24 Hours or 06:00 - 22:00',
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
                { label: 'Temporarily Closed', value: 'temporarily_closed' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Under Maintenance', value: 'under_maintenance' },
            ],
        },
        {
            name: 'notes',
            type: 'textarea',
            label: 'Notes',
            rows: 4,
        },
        {
            name: 'has_petrol',
            type: 'checkbox',
            label: 'Petrol Available',
            default_value: true,
        },
        {
            name: 'has_diesel',
            type: 'checkbox',
            label: 'Diesel Available',
            default_value: true,
        },
        {
            name: 'has_kerosene',
            type: 'checkbox',
            label: 'Kerosene Available',
            default_value: false,
        },
        {
            name: 'has_lpg',
            type: 'checkbox',
            label: 'LPG Available',
            default_value: false,
        },
    ],
}

const raw: PageConfig = {
    id: 'stations',
    title: 'All Stations',
    page_title: 'Station Management',
    description:
        'Manage fuel stations, operators, locations, licences and operational status.',
    type: 'list',
    page_type: 'list',
    path: `${stationsBaseUrl}`,
    route: `${stationsBaseUrl}`,
    api,

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
            id: 'omc',
            type: 'select',
            label: 'Oil Marketing Company',
            field: 'oil_marketing_company_id',
            query_parameter: 'oil_marketing_company_id',
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
                id: 'omc',
                type: 'text',
                header: 'OMC',
                accessor: 'oil_marketing_company.name',
                sortable: true,
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
                        path: `${stationsBaseUrl}/{id}`,
                    },
                    {
                        id: 'edit',
                        type: 'edit',
                        label: 'Edit',
                        icon: 'Pencil',
                        path: `${stationsBaseUrl}/{id}/edit`,
                    },
                    {
                        id: 'price-board',
                        type: 'navigate',
                        label: 'Price Board',
                        icon: 'BadgeDollarSign',
                        path: `${stationsBaseUrl}/{id}/price-boards`,
                    },
                    {
                        id: 'inspections',
                        type: 'navigate',
                        label: 'Inspections',
                        icon: 'ClipboardCheck',
                        path: `${stationsBaseUrl}/station-inspections?station_id={id}`,
                    },
                    {
                        id: 'documents',
                        type: 'navigate',
                        label: 'Documents',
                        icon: 'Files',
                        path: `${stationsBaseUrl}/station-documents?station_id={id}`,
                    },
                    {
                        id: 'delete',
                        type: 'delete',
                        label: 'Delete',
                        icon: 'Trash2',
                        endpoint: `${stationsBaseUrl}/:id`,
                        permission: {
                            any: ['stations.delete'],
                        },
                        requires_confirmation: true,
                        confirmation:
                            'Are you sure you want to delete this station?',
                        success_message:
                            'Station deleted successfully.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add-station',
            type: 'navigate',
            label: 'Add Station',
            icon: 'Plus',
            path: `${stationsBaseUrl}/create`,
        },
    ],

    sub_pages: [
        {
            id: 'stations-create',
            parentId: 'stations',
            title: 'Add Station',
            page_title: 'Add Station',
            type: 'create',
            page_type: 'create',
            path: `${stationsBaseUrl}/create`,
            route: `${stationsBaseUrl}/create`,
            api,
            form: {
                ...form,
                submitLabel: 'Add Station',
            },
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Stations',
                    icon: 'ArrowLeft',
                    path: `${stationsBaseUrl}`,
                    variant: 'secondary',
                }
            ]
        },
        {
            id: 'stations-details',
            parentId: 'stations',
            title: 'Station Details',
            page_title: 'Station Details',
            type: 'details',
            page_type: 'details',
            path: `${stationsBaseUrl}/:id`,
            route: `${stationsBaseUrl}/:id`,
            api,
            recordIdParam: 'id',

            fields: [
                'name',
                'code',
                'oil_marketing_company',
                'station_type',
                'station_group',
                'license_number',
                'license_expiry_date',
                'manager_name',
                'phone',
                'province',
                'district',
                'address',
                'total_tanks',
                'total_pumps',
                'total_attendants',
                'status',
            ],

            sections: [
                {
                    id: 'station-information',
                    title: 'Station Information',
                    fields: [
                        {
                            key: 'name',
                            label: 'Station Name',
                            type: 'text',
                        },
                        {
                            key: 'code',
                            label: 'Station Code',
                            type: 'text',
                            copyable: true,
                        },
                        {
                            key: 'oil_marketing_company.name',
                            label: 'Oil Marketing Company',
                            type: 'text',
                        },
                        {
                            key: 'station_type.name',
                            label: 'Station Type',
                            type: 'text',
                        },
                        {
                            key: 'station_group.name',
                            label: 'Station Group',
                            type: 'text',
                        },
                    ],
                },
                {
                    id: 'licensing',
                    title: 'Licensing',
                    fields: [
                        {
                            key: 'license_number',
                            label: 'ERB Licence',
                            type: 'text',
                            copyable: true,
                        },
                        {
                            key: 'license_expiry_date',
                            label: 'Licence Expiry',
                            type: 'date',
                        },
                    ],
                },
                {
                    id: 'location',
                    title: 'Location',
                    fields: [
                        {
                            key: 'province.name',
                            label: 'Province',
                            type: 'text',
                        },
                        {
                            key: 'district.name',
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
                            label: 'Address',
                            type: 'text',
                        },
                        {
                            key: 'latitude',
                            label: 'Latitude',
                            type: 'number',
                        },
                        {
                            key: 'longitude',
                            label: 'Longitude',
                            type: 'number',
                        },
                    ],
                },
                {
                    id: 'operations',
                    title: 'Operations',
                    fields: [
                        {
                            key: 'manager_name',
                            label: 'Station Manager',
                            type: 'text',
                        },
                        {
                            key: 'operating_hours',
                            label: 'Operating Hours',
                            type: 'text',
                        },
                        {
                            key: 'total_tanks',
                            label: 'Tanks',
                            type: 'number',
                        },
                        {
                            key: 'total_pumps',
                            label: 'Pumps',
                            type: 'number',
                        },
                        {
                            key: 'total_attendants',
                            label: 'Attendants',
                            type: 'number',
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            type: 'badge',
                            badgeVariants: {
                                active: 'success',
                                inactive: 'warning',
                                temporarily_closed: 'warning',
                                suspended: 'danger',
                                under_maintenance: 'warning',
                            },
                        },
                    ],
                },
            ],

            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Stations',
                    icon: 'ArrowLeft',
                    path: `${stationsBaseUrl}`,
                    variant: 'secondary',
                }
            ]
        },
        {
            id: 'stations-edit',
            parentId: 'stations',
            title: 'Edit Station',
            page_title: 'Edit Station',
            type: 'edit',
            page_type: 'edit',
            path: `${stationsBaseUrl}/:id/edit`,
            route: `${stationsBaseUrl}/:id/edit`,
            authentication: {
                required: true,
            },
            permissions: {
                any: ['stations.update'],
            },
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
        {
            id: 'stations-price-boards',
            parentId: 'stations',
            title: 'Station Price Boards',
            page_title: 'Station Price Boards',
            description: 'Manage price boards for this station.',
            type: 'list',
            page_type: 'list',
            path: `${stationsBaseUrl}/:id/price-boards`,
            route: `${stationsBaseUrl}/:id/price-boards`,
            authentication: { required: true },
            permissions: { any: ['station_price_boards.view'] },
            api: priceBoardsApi,
            statistics: [
                {
                    id: 'total-price-boards',
                    type: 'statistic',
                    title: 'Total Price Boards',
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
                    label: 'Back to Stations',
                    path: `${stationsBaseUrl}`,
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

export const stationsListConfig = validateConfig(
    'stations list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const stationsCreateConfig = validateConfig(
    'stations create page',
    pageConfigSchema,
    stationsListConfig.sub_pages?.find(
        (page) => page.type === 'create',
    ),
)

export const stationsDetailsConfig = validateConfig(
    'stations details page',
    pageConfigSchema,
    stationsListConfig.sub_pages?.find(
        (page) => page.type === 'details',
    ),
)

export const stationsEditConfig = validateConfig(
    'stations edit page',
    pageConfigSchema,
    stationsListConfig.sub_pages?.find(
        (page) => page.type === 'edit',
    ),
)

export const stationsPriceBoardsConfig = validateConfig(
    'station price boards page',
    pageConfigSchema,
    stationsListConfig.sub_pages?.find(
        (page) => page.id === 'stations-price-boards',
    ),
) as ListPageConfig
