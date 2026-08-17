import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'

import type {
    ApiConfig,
    FormConfig,
    ListPageConfig,
    PageConfig,
} from '@/types/configuration.types'

const api: ApiConfig = {
    baseUrl: '/api', data_mapping: {
        type: 'paginated',
        items: 'data.items',
        total: 'data.total',
        page: 'data.page',
        pageSize: 'data.pageSize',
    },
    endpoints: {
        list: {
            path: '/accounts/government-institutions',
            method: 'GET',
        },
        item: {
            path: '/accounts/government-institutions/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/accounts/government-institutions',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/accounts/government-institutions/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/accounts/government-institutions/{id}',
            method: 'DELETE',
        },
    },
}

const vehiclesApi: ApiConfig = {
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
            path: '/accounts/government-institutions/{id}/vehicles',
            method: 'GET',
        },
    },
}

const allocationsApi: ApiConfig = {
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
            path: '/accounts/government-institutions/{id}/allocations',
            method: 'GET',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/accounts/government-institutions',
    resetEnabled: true,
    layout: {
        type: 'columns',
        columns: 3,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'Institution Name',
            required: true,
        },
        {
            name: 'code',
            type: 'text',
            label: 'Institution Code',
            required: true,
        },
        {
            name: 'institution_type',
            type: 'select',
            label: 'Institution Type',
            required: true,
            options: [
                { label: 'Ministry', value: 'ministry' },
                { label: 'Government Department', value: 'department' },
                { label: 'Agency', value: 'agency' },
                { label: 'Local Authority', value: 'local_authority' },
                { label: 'Statutory Body', value: 'statutory_body' },
                { label: 'State-Owned Enterprise', value: 'soe' },
                { label: 'Public Institution', value: 'public_institution' },
            ],
        },
        {
            name: 'ministry',
            type: 'text',
            label: 'Parent Ministry',
        },
        {
            name: 'department',
            type: 'text',
            label: 'Department',
        },
        {
            name: 'vote_number',
            type: 'text',
            label: 'Vote Number',
        },
        {
            name: 'cost_centre',
            type: 'text',
            label: 'Cost Centre',
        },
        {
            name: 'tpin',
            type: 'text',
            label: 'TPIN',
        },
        {
            name: 'controlling_officer',
            type: 'text',
            label: 'Controlling Officer',
        },
        {
            name: 'contact_person',
            type: 'text',
            label: 'Contact Officer',
            required: true,
        },
        {
            name: 'contact_person_phone',
            type: 'text',
            label: 'Contact Officer Phone',
            required: true,
        },
        {
            name: 'contact_person_email',
            type: 'email',
            label: 'Contact Officer Email',
        },
        {
            name: 'email',
            type: 'email',
            label: 'Institution Email',
        },
        {
            name: 'phone',
            type: 'text',
            label: 'Institution Phone',
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
            label: 'Physical Address',
            rows: 4,
            required: true,
        },
        {
            name: 'account_number',
            type: 'text',
            label: 'Account Number',
        },
        {
            name: 'budget_limit',
            type: 'number',
            label: 'Fuel Budget Limit',
            default_value: 0,
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
            required: true,
            default_value: 'pending',
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
    id: 'government-institutions',
    title: 'Government Institutions',
    page_title: 'Government Institutions',
    description: 'Manage government institutions and public-sector fuel accounts.',
    type: 'list',
    page_type: 'list',
    path: '/accounts/government-institutions',
    route: '/accounts/government-institutions',
    api,
    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total Institutions',
            dataPath: 'statistics.total',
            icon: 'Landmark',
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
            id: 'vehicles',
            type: 'statistic',
            title: 'Registered Vehicles',
            dataPath: 'statistics.vehicles',
            icon: 'Car',
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
            placeholder:
                'Search institution, ministry, vote number or account number',
        },
        {
            id: 'institution-type',
            type: 'select',
            label: 'Institution Type',
            field: 'institution_type',
            query_parameter: 'institution_type',
            options: [
                { label: 'Ministry', value: 'ministry' },
                { label: 'Department', value: 'department' },
                { label: 'Agency', value: 'agency' },
                { label: 'Local Authority', value: 'local_authority' },
                { label: 'Statutory Body', value: 'statutory_body' },
                { label: 'State-Owned Enterprise', value: 'soe' },
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
                header: 'Institution',
                accessor: 'name',
                sortable: true,
                searchable: true,
            },
            {
                id: 'type',
                type: 'text',
                header: 'Type',
                accessor: 'institution_type',
            },
            {
                id: 'ministry',
                type: 'text',
                header: 'Ministry',
                accessor: 'ministry',
            },
            {
                id: 'vote-number',
                type: 'text',
                header: 'Vote No.',
                accessor: 'vote_number',
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
                        path: '/accounts/government-institutions/{id}',
                    },
                    {
                        id: 'vehicles',
                        type: 'navigate',
                        label: 'Vehicles',
                        icon: 'Car',
                        path: '/accounts/government-institutions/{id}/vehicles',
                    },
                    {
                        id: 'allocations',
                        type: 'navigate',
                        label: 'Allocations',
                        icon: 'Fuel',
                        path: '/accounts/government-institutions/{id}/allocations',
                    },
                    {
                        id: 'edit',
                        type: 'edit',
                        label: 'Edit',
                        icon: 'Pencil',
                        path: '/accounts/government-institutions/{id}/edit',
                    },
                    {
                        id: 'delete',
                        type: 'delete',
                        label: 'Delete',
                        icon: 'Trash2',
                        endpoint:
                            '/api/accounts/government-institutions/{id}',
                        requires_confirmation: true,
                        confirmation:
                            'Delete this government institution?',
                        success_message:
                            'Government institution deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'add',
            type: 'navigate',
            label: 'Add Government Institution',
            icon: 'Plus',
            path: '/accounts/government-institutions/create',
        },
    ],

    sub_pages: [
        {
            id: 'government-institutions-create',
            parentId: 'government-institutions',
            title: 'Add Government Institution',
            page_title: 'Add Government Institution',
            type: 'create',
            page_type: 'create',
            path: '/accounts/government-institutions/create',
            route: '/accounts/government-institutions/create',
            api,
            form: {
                ...form,
                submitLabel: 'Add Government Institution',
            },
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Government Institutions',
                    path: '/accounts/government-institutions',
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
        },
        {
            id: 'government-institutions-details',
            parentId: 'government-institutions',
            title: 'Government Institution Details',
            page_title: 'Government Institution Details',
            type: 'details',
            page_type: 'details',
            path: '/accounts/government-institutions/:id',
            route: '/accounts/government-institutions/:id',
            api,
            recordIdParam: 'id',
            fields: [
                'name',
                'code',
                'account_number',
                'institution_type',
                'ministry',
                'department',
                'vote_number',
                'cost_centre',
                'tpin',
                'controlling_officer',
                'contact_person',
                'province',
                'district',
                'account_balance',
                'budget_limit',
                'credit_limit',
                'verification_status',
                'status',
            ],
            sections: [
                {
                    id: 'institution',
                    title: 'Institution Information',
                    fields: [
                        { key: 'name', label: 'Institution', type: 'text' },
                        { key: 'code', label: 'Code', type: 'text' },
                        { key: 'institution_type', label: 'Type', type: 'text' },
                        { key: 'ministry', label: 'Parent Ministry', type: 'text' },
                        { key: 'department', label: 'Department', type: 'text' },
                        { key: 'vote_number', label: 'Vote Number', type: 'text' },
                        { key: 'cost_centre', label: 'Cost Centre', type: 'text' },
                    ],
                },
                {
                    id: 'financial',
                    title: 'Fuel Account Information',
                    fields: [
                        { key: 'account_number', label: 'Account Number', type: 'text' },
                        { key: 'account_balance', label: 'Balance', type: 'number' },
                        { key: 'budget_limit', label: 'Fuel Budget', type: 'number' },
                        { key: 'credit_limit', label: 'Credit Limit', type: 'number' },
                        { key: 'total_vehicles', label: 'Vehicles', type: 'number' },
                        { key: 'total_cards', label: 'Cards', type: 'number' },
                    ],
                },
            ],
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Government Institutions',
                    path: '/accounts/government-institutions',
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
        },
        {
            id: 'government-institutions-edit',
            parentId: 'government-institutions',
            title: 'Edit Government Institution',
            page_title: 'Edit Government Institution',
            type: 'edit',
            page_type: 'edit',
            path: '/accounts/government-institutions/:id/edit',
            route: '/accounts/government-institutions/:id/edit',
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
                    label: 'Back to Government Institutions',
                    path: '/accounts/government-institutions',
                    icon: 'ArrowLeft',
                    variant: 'secondary',
                },
            ],
        },
        {
            id: 'government-institutions-vehicles',
            parentId: 'government-institutions',
            title: 'Government Institution Vehicles',
            page_title: 'Registered Vehicles',
            description: 'View vehicles registered to this government institution.',
            type: 'list',
            page_type: 'list',
            path: '/accounts/government-institutions/:id/vehicles',
            route: '/accounts/government-institutions/:id/vehicles',
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
            ],
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Government Institutions',
                    path: '/accounts/government-institutions',
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
                        id: 'card-number',
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
            id: 'government-institutions-allocations',
            parentId: 'government-institutions',
            title: 'Government Institution Allocations',
            page_title: 'Fuel Allocations',
            description: 'Review fuel budget allocations for this government institution.',
            type: 'list',
            page_type: 'list',
            path: '/accounts/government-institutions/:id/allocations',
            route: '/accounts/government-institutions/:id/allocations',
            api: allocationsApi,
            statistics: [
                {
                    id: 'total-allocated',
                    type: 'statistic',
                    title: 'Total Allocated',
                    dataPath: 'statistics.total_allocated',
                    icon: 'Fuel',
                    format: 'currency',
                },
                {
                    id: 'total-used',
                    type: 'statistic',
                    title: 'Total Used',
                    dataPath: 'statistics.total_used',
                    icon: 'Receipt',
                    format: 'currency',
                },
                {
                    id: 'available-balance',
                    type: 'statistic',
                    title: 'Available Balance',
                    dataPath: 'statistics.available_balance',
                    icon: 'WalletCards',
                    format: 'currency',
                },
            ],
            page_actions: [
                {
                    id: 'back',
                    type: 'navigate',
                    label: 'Back to Government Institutions',
                    path: '/accounts/government-institutions',
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
                    placeholder: 'Search reference, period or cost centre',
                },
                {
                    id: 'allocation-date',
                    type: 'date_range',
                    label: 'Allocation Date',
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
                        { label: 'Active', value: 'active' },
                        { label: 'Exhausted', value: 'exhausted' },
                        { label: 'Expired', value: 'expired' },
                        { label: 'Cancelled', value: 'cancelled' },
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
                    defaultColumn: 'allocation_date',
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
                        id: 'period',
                        type: 'text',
                        header: 'Period',
                        accessor: 'period',
                        sortable: true,
                    },
                    {
                        id: 'cost-centre',
                        type: 'text',
                        header: 'Cost Centre',
                        accessor: 'cost_centre',
                    },
                    {
                        id: 'allocated-amount',
                        type: 'number',
                        header: 'Allocated',
                        accessor: 'allocated_amount',
                        sortable: true,
                        format: 'currency',
                        currency: 'ZMW',
                    },
                    {
                        id: 'used-amount',
                        type: 'number',
                        header: 'Used',
                        accessor: 'used_amount',
                        sortable: true,
                        format: 'currency',
                        currency: 'ZMW',
                    },
                    {
                        id: 'remaining-amount',
                        type: 'number',
                        header: 'Remaining',
                        accessor: 'remaining_amount',
                        sortable: true,
                        format: 'currency',
                        currency: 'ZMW',
                    },
                    {
                        id: 'allocation-date',
                        type: 'datetime',
                        header: 'Allocated',
                        accessor: 'allocation_date',
                        sortable: true,
                    },
                    {
                        id: 'expiry-date',
                        type: 'datetime',
                        header: 'Expires',
                        accessor: 'expiry_date',
                        sortable: true,
                    },
                    {
                        id: 'status',
                        type: 'badge',
                        header: 'Status',
                        accessor: 'status',
                        sortable: true,
                        options: {
                            active: 'success',
                            exhausted: 'warning',
                            expired: 'danger',
                            cancelled: 'danger',
                        },
                    },
                ],
            },
        },
    ],
}

export const governmentInstitutionsListConfig = validateConfig(
    'government institutions list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const governmentInstitutionsCreateConfig = validateConfig(
    'government institutions create page',
    pageConfigSchema,
    governmentInstitutionsListConfig.sub_pages?.find(
        (page) => page.type === 'create',
    ),
)

export const governmentInstitutionsDetailsConfig = validateConfig(
    'government institutions details page',
    pageConfigSchema,
    governmentInstitutionsListConfig.sub_pages?.find(
        (page) => page.type === 'details',
    ),
)

export const governmentInstitutionsEditConfig = validateConfig(
    'government institutions edit page',
    pageConfigSchema,
    governmentInstitutionsListConfig.sub_pages?.find(
        (page) => page.type === 'edit',
    ),
)

export const governmentInstitutionsVehiclesConfig = validateConfig(
    'government institutions vehicles page',
    pageConfigSchema,
    governmentInstitutionsListConfig.sub_pages?.find(
        (page) => page.id === 'government-institutions-vehicles',
    ),
) as ListPageConfig

export const governmentInstitutionsAllocationsConfig = validateConfig(
    'government institutions allocations page',
    pageConfigSchema,
    governmentInstitutionsListConfig.sub_pages?.find(
        (page) => page.id === 'government-institutions-allocations',
    ),
) as ListPageConfig
