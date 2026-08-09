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