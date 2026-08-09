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
            path: '/stations/station-documents',
            method: 'GET',
        },
        item: {
            path: '/stations/station-documents/{id}',
            method: 'GET',
            responseMappingPath: 'data',
        },
        create: {
            path: '/stations/station-documents',
            method: 'POST',
            responseMappingPath: 'data',
        },
        update: {
            path: '/stations/station-documents/{id}',
            method: 'PUT',
            responseMappingPath: 'data',
        },
        delete: {
            path: '/stations/station-documents/{id}',
            method: 'DELETE',
        },
    },
}

const form: FormConfig = {
    cancelPath: '/stations/station-documents',
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
            name: 'document_type',
            type: 'select',
            label: 'Document Type',
            required: true,
            options: [
                {
                    label: 'ERB Licence',
                    value: 'erb_license',
                },
                {
                    label: 'Business Licence',
                    value: 'business_license',
                },
                {
                    label: 'Fire Certificate',
                    value: 'fire_certificate',
                },
                {
                    label: 'Environmental Certificate',
                    value: 'environmental_certificate',
                },
                {
                    label: 'Insurance',
                    value: 'insurance',
                },
                {
                    label: 'Calibration Certificate',
                    value: 'calibration_certificate',
                },
                {
                    label: 'Inspection Report',
                    value: 'inspection_report',
                },
                {
                    label: 'Ownership Document',
                    value: 'ownership_document',
                },
                {
                    label: 'Lease Agreement',
                    value: 'lease_agreement',
                },
                {
                    label: 'Other',
                    value: 'other',
                },
            ],
        },
        {
            name: 'document_name',
            type: 'text',
            label: 'Document Name',
            required: true,
        },
        {
            name: 'document_number',
            type: 'text',
            label: 'Document Number',
        },
        {
            name: 'issued_by',
            type: 'text',
            label: 'Issued By',
        },
        {
            name: 'issue_date',
            type: 'date',
            label: 'Issue Date',
        },
        {
            name: 'expiry_date',
            type: 'date',
            label: 'Expiry Date',
        },
        {
            name: 'file',
            type: 'file',
            label: 'Document',
            required: true,
        },
        {
            name: 'verification_status',
            type: 'select',
            label: 'Verification',
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
            default_value: 'valid',
            options: [
                { label: 'Valid', value: 'valid' },
                { label: 'Expired', value: 'expired' },
                {
                    label: 'Expiring Soon',
                    value: 'expiring_soon',
                },
                { label: 'Revoked', value: 'revoked' },
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
    id: 'station-documents',

    title: 'Station Documents',
    page_title: 'Station Documents',

    description:
        'Manage station licences, certificates, insurance and supporting station-documents.',

    type: 'list',
    page_type: 'list',

    path: '/stations/station-documents',
    route: '/stations/station-documents',

    api,

    statistics: [
        {
            id: 'total',
            type: 'statistic',
            title: 'Total station-documents',
            dataPath: 'statistics.total',
            icon: 'Files',
            format: 'number',
        },
        {
            id: 'valid',
            type: 'statistic',
            title: 'Valid',
            dataPath: 'statistics.valid',
            icon: 'FileCheck2',
            format: 'number',
        },
        {
            id: 'expiring',
            type: 'statistic',
            title: 'Expiring Soon',
            dataPath: 'statistics.expiring_soon',
            icon: 'ClockAlert',
            format: 'number',
        },
        {
            id: 'expired',
            type: 'statistic',
            title: 'Expired',
            dataPath: 'statistics.expired',
            icon: 'FileX2',
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
                'Search station, document name or number',
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
            id: 'document-type',
            type: 'select',
            label: 'Document Type',
            field: 'document_type',
            query_parameter: 'document_type',
            options: [
                {
                    label: 'ERB Licence',
                    value: 'erb_license',
                },
                {
                    label: 'Business Licence',
                    value: 'business_license',
                },
                {
                    label: 'Fire Certificate',
                    value: 'fire_certificate',
                },
                {
                    label: 'Environmental Certificate',
                    value: 'environmental_certificate',
                },
                {
                    label: 'Insurance',
                    value: 'insurance',
                },
            ],
        },
        {
            id: 'status',
            type: 'select',
            label: 'Status',
            field: 'status',
            query_parameter: 'status',
            options: [
                { label: 'Valid', value: 'valid' },
                {
                    label: 'Expiring Soon',
                    value: 'expiring_soon',
                },
                { label: 'Expired', value: 'expired' },
                { label: 'Revoked', value: 'revoked' },
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
            defaultColumn: 'expiry_date',
            defaultDirection: 'asc',
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
                id: 'document-name',
                type: 'text',
                header: 'Document',
                accessor: 'document_name',
                searchable: true,
            },
            {
                id: 'document-type',
                type: 'text',
                header: 'Type',
                accessor: 'document_type',
            },
            {
                id: 'document-number',
                type: 'text',
                header: 'Document No.',
                accessor: 'document_number',
            },
            {
                id: 'issued-by',
                type: 'text',
                header: 'Issued By',
                accessor: 'issued_by',
            },
            {
                id: 'expiry-date',
                type: 'datetime',
                header: 'Expiry',
                accessor: 'expiry_date',
                sortable: true,
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
                    valid: 'success',
                    expiring_soon: 'warning',
                    expired: 'danger',
                    revoked: 'danger',
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
                        id: 'download',
                        type: 'navigate',
                        label: 'Download',
                        icon: 'Download',
                        path:
                            '/api/stations/station-documents/{id}/download',
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
                            '/api/stations/station-documents/{id}',
                        requires_confirmation: true,
                        confirmation:
                            'Delete this station document?',
                        success_message:
                            'Station document deleted.',
                    },
                ],
            },
        ],
    },

    page_actions: [
        {
            id: 'upload',
            type: 'navigate',
            label: 'Upload Document',
            icon: 'Upload',
            path: '/stations/station-documents/create',
        },
    ],

    sub_pages: [
        {
            id: 'station-documents-create',
            parentId: 'station-documents',
            title: 'Upload Station Document',
            page_title: 'Upload Station Document',
            type: 'create',
            page_type: 'create',
            path: '/stations/station-documents/create',
            route: '/stations/station-documents/create',
            api,
            form: {
                ...form,
                submitLabel: 'Upload Document',
            },
        },
        {
            id: 'station-documents-details',
            parentId: 'station-documents',
            title: 'Document Details',
            page_title: 'Station Document Details',
            type: 'details',
            page_type: 'details',
            path: '/stations/station-documents/:id',
            route: '/stations/station-documents/:id',
            api,
            recordIdParam: 'id',

            fields: [
                'station',
                'document_name',
                'document_type',
                'document_number',
                'issued_by',
                'issue_date',
                'expiry_date',
                'verification_status',
                'status',
                'notes',
            ],

            sections: [
                {
                    id: 'document',
                    title: 'Document Information',
                    fields: [
                        {
                            key: 'station.name',
                            label: 'Station',
                            type: 'text',
                        },
                        {
                            key: 'document_name',
                            label: 'Document',
                            type: 'text',
                        },
                        {
                            key: 'document_type',
                            label: 'Type',
                            type: 'text',
                        },
                        {
                            key: 'document_number',
                            label: 'Document Number',
                            type: 'text',
                            copyable: true,
                        },
                        {
                            key: 'issued_by',
                            label: 'Issued By',
                            type: 'text',
                        },
                        {
                            key: 'file',
                            label: 'Document File',
                            type: 'file',
                        },
                    ],
                },
                {
                    id: 'validity',
                    title: 'Validity',
                    fields: [
                        {
                            key: 'issue_date',
                            label: 'Issue Date',
                            type: 'date',
                        },
                        {
                            key: 'expiry_date',
                            label: 'Expiry Date',
                            type: 'date',
                        },
                        {
                            key: 'verification_status',
                            label: 'Verification',
                            type: 'badge',
                            badgeVariants: {
                                verified: 'success',
                                pending: 'warning',
                                rejected: 'danger',
                            },
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            type: 'badge',
                            badgeVariants: {
                                valid: 'success',
                                expiring_soon: 'warning',
                                expired: 'danger',
                                revoked: 'danger',
                            },
                        },
                    ],
                },
            ],
        },
        {
            id: 'station-documents-edit',
            parentId: 'station-documents',
            title: 'Edit Document',
            page_title: 'Edit Station Document',
            type: 'edit',
            page_type: 'edit',
            path: '/stations/station-documents/:id/edit',
            route: '/stations/station-documents/:id/edit',
            api,
            form: {
                ...form,
                submitLabel: 'Save Changes',
            },
            recordIdParam: 'id',
        },
    ],
}

export const stationDocumentsListConfig = validateConfig(
    'station station-documents list page',
    pageConfigSchema,
    raw,
) as ListPageConfig

export const stationDocumentsUploadConfig = validateConfig(
    'stations documents upload',
    pageConfigSchema,
    stationDocumentsListConfig.sub_pages?.find(
        (page) => page.type === 'create',
    )
)
