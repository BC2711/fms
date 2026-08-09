type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type PageType =
    | "list"
    | "create"
    | "details"
    | "edit"
    | "dashboard"
    | "report"
    | "settings";

interface SubPageConfiguration {
    id: string;
    parent_id: string;
    sub_page_name: string;
    page_type: PageType;
    slug: string;
    route: string;
    description?: string;
    icon?: string;
    api_url: string;
    api_method: HttpMethod;
    permission?: string;
    component: string;
    form_mode?: "create" | "edit";
    load_existing_data?: boolean;
    redirect_after_success?: string;
    is_active: boolean;
    is_visible: boolean;
}

export interface PageConfiguration {
    id: string;
    key: string;
    module: string;
    page_name: string;
    page_title: string;
    page_type: PageType;
    slug: string;
    route: string;
    description?: string;
    icon?: string;
    order: number;
    is_active: boolean;
    is_visible: boolean;
    sub_pages: SubPageConfiguration[];
}

const dashboard = [
    {
        id: "test-item-list",
        key: "test_items",
        module: "test_management",

        page_name: "Test Items",
        page_title: "Test Item Management",
        page_type: "list",
        slug: "test-items",
        route: "/test-items",
        description: "Create, view, update, and manage test items.",

        icon: "FlaskConical",
        order: 1,
        is_active: true,
        is_visible: true,

        api: {
            base_url: "https://api.example.com/test-items",
            list_url: "https://api.example.com/test-items",
            create_url: "https://api.example.com/test-items",
            details_url: "https://api.example.com/test-items/{id}",
            update_url: "https://api.example.com/test-items/{id}",
            delete_url: "https://api.example.com/test-items/{id}",

            methods: {
                list: "GET",
                create: "POST",
                details: "GET",
                update: "PUT",
                partial_update: "PATCH",
                delete: "DELETE"
            },

            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },

            timeout: 30000
        },

        authentication: {
            required: true,
            strategy: "bearer_token"
        },

        authorization: {
            roles: [
                "super_admin",
                "admin",
                "manager"
            ],

            permissions: {
                view: "test_items.view",
                create: "test_items.create",
                update: "test_items.update",
                delete: "test_items.delete",
                export: "test_items.export"
            }
        },

        layout: {
            type: "dashboard",
            container_width: "full",
            show_sidebar: true,
            show_navbar: true,
            show_breadcrumbs: true
        },

        breadcrumbs: [
            {
                label: "Dashboard",
                route: "/dashboard"
            },
            {
                label: "Test Items",
                route: "/test-items"
            }
        ],

        statistics: [
            {
                key: "total",
                label: "Total Items",
                value_field: "total",
                icon: "Database"
            },
            {
                key: "active",
                label: "Active Items",
                value_field: "active_count",
                icon: "CircleCheck"
            },
            {
                key: "inactive",
                label: "Inactive Items",
                value_field: "inactive_count",
                icon: "CircleX"
            }
        ],

        table: {
            enabled: true,
            primary_key: "id",
            selectable: true,
            searchable: true,
            sortable: true,
            striped: true,
            sticky_header: true,

            columns: [
                {
                    key: "id",
                    label: "ID",
                    type: "number",
                    sortable: true,
                    visible: true
                },
                {
                    key: "name",
                    label: "Name",
                    type: "text",
                    sortable: true,
                    searchable: true,
                    visible: true
                },
                {
                    key: "description",
                    label: "Description",
                    type: "text",
                    sortable: false,
                    visible: true
                },
                {
                    key: "status",
                    label: "Status",
                    type: "badge",
                    sortable: true,
                    visible: true,
                    options: [
                        {
                            value: "active",
                            label: "Active",
                            variant: "success"
                        },
                        {
                            value: "inactive",
                            label: "Inactive",
                            variant: "danger"
                        },
                        {
                            value: "draft",
                            label: "Draft",
                            variant: "warning"
                        }
                    ]
                },
                {
                    key: "created_at",
                    label: "Created At",
                    type: "datetime",
                    sortable: true,
                    visible: true
                },
                {
                    key: "updated_at",
                    label: "Updated At",
                    type: "datetime",
                    sortable: true,
                    visible: false
                },
                {
                    key: "actions",
                    label: "Actions",
                    type: "actions",
                    sortable: false,
                    visible: true
                }
            ],

            row_actions: [
                {
                    key: "view",
                    label: "View",
                    icon: "Eye",
                    route: "/test-items/{id}",
                    permission: "test_items.view"
                },
                {
                    key: "edit",
                    label: "Edit",
                    icon: "Pencil",
                    route: "/test-items/{id}/edit",
                    permission: "test_items.update"
                },
                {
                    key: "delete",
                    label: "Delete",
                    icon: "Trash2",
                    action: "delete",
                    permission: "test_items.delete",
                    requires_confirmation: true
                }
            ]
        },

        filters: [
            {
                key: "search",
                label: "Search",
                type: "search",
                placeholder: "Search test items...",
                query_parameter: "search"
            },
            {
                key: "status",
                label: "Status",
                type: "select",
                query_parameter: "status",
                options: [
                    {
                        value: "",
                        label: "All Statuses"
                    },
                    {
                        value: "active",
                        label: "Active"
                    },
                    {
                        value: "inactive",
                        label: "Inactive"
                    },
                    {
                        value: "draft",
                        label: "Draft"
                    }
                ]
            },
            {
                key: "created_at",
                label: "Created Date",
                type: "date_range",
                query_parameter: "created_at"
            }
        ],

        pagination: {
            enabled: true,
            page_parameter: "page",
            page_size_parameter: "page_size",
            default_page: 1,
            default_page_size: 10,
            page_size_options: [10, 25, 50, 100]
        },

        sorting: {
            enabled: true,
            sort_parameter: "sort_by",
            direction_parameter: "sort_order",
            default_sort_field: "created_at",
            default_sort_direction: "desc"
        },

        form: {
            enabled: true,
            submit_type: "json",
            reset_after_submit: false,

            fields: [
                {
                    key: "name",
                    name: "name",
                    label: "Name",
                    type: "text",
                    placeholder: "Enter item name",
                    required: true,
                    default_value: "",
                    validation: {
                        min_length: 2,
                        max_length: 100
                    },
                    grid: {
                        columns: 6
                    }
                },
                {
                    key: "status",
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    default_value: "active",
                    options: [
                        {
                            value: "active",
                            label: "Active"
                        },
                        {
                            value: "inactive",
                            label: "Inactive"
                        },
                        {
                            value: "draft",
                            label: "Draft"
                        }
                    ],
                    grid: {
                        columns: 6
                    }
                },
                {
                    key: "description",
                    name: "description",
                    label: "Description",
                    type: "textarea",
                    placeholder: "Enter item description",
                    required: false,
                    default_value: "",
                    validation: {
                        max_length: 500
                    },
                    grid: {
                        columns: 12
                    }
                }
            ],

            buttons: {
                submit: {
                    label: "Save Test Item",
                    icon: "Save"
                },
                cancel: {
                    label: "Cancel",
                    route: "/test-items"
                },
                reset: {
                    label: "Reset"
                }
            }
        },

        page_actions: [
            {
                key: "create",
                label: "Add Test Item",
                icon: "Plus",
                route: "/test-items/create",
                permission: "test_items.create",
                position: "header"
            },
            {
                key: "refresh",
                label: "Refresh",
                icon: "RefreshCw",
                action: "refresh",
                position: "header"
            },
            {
                key: "export",
                label: "Export",
                icon: "Download",
                action: "export",
                permission: "test_items.export",
                formats: ["csv", "xlsx", "pdf"],
                position: "header"
            }
        ],

        states: {
            loading: {
                message: "Loading test items...",
                component: "TableSkeleton"
            },
            empty: {
                title: "No test items found",
                message: "Create your first test item to get started.",
                icon: "Inbox"
            },
            error: {
                title: "Unable to load test items",
                message: "An error occurred while loading the records.",
                retry_enabled: true
            }
        },

        notifications: {
            create_success: "Test item created successfully.",
            update_success: "Test item updated successfully.",
            delete_success: "Test item deleted successfully.",
            create_error: "Failed to create test item.",
            update_error: "Failed to update test item.",
            delete_error: "Failed to delete test item."
        },

        confirmation: {
            delete: {
                title: "Delete Test Item",
                message: "Are you sure you want to delete this test item?",
                confirm_label: "Delete",
                cancel_label: "Cancel",
                variant: "danger"
            }
        },

        cache: {
            enabled: true,
            strategy: "stale_while_revalidate",
            ttl_seconds: 300,
            cache_key: "test_items"
        },

        audit: {
            enabled: true,
            track_create: true,
            track_update: true,
            track_delete: true,
            track_view: false
        },

        seo: {
            title: "Test Item Management",
            description: "Manage test items in the system.",
            no_index: true
        },

        data_mapping: {
            list_path: "data.items",
            item_path: "data",
            total_path: "data.total",
            current_page_path: "data.page",
            page_size_path: "data.page_size"
        },

        sub_pages: [
            {
                id: "test-item-create",
                parent_id: "test-item-list",
                sub_page_name: "Create Test Item",
                page_type: "create",
                slug: "create",
                route: "/test-items/create",
                description: "Create a new test item.",
                icon: "Plus",

                api_url: "https://api.example.com/test-items",
                api_method: "POST",

                permission: "test_items.create",
                component: "TestItemForm",

                form_mode: "create",
                redirect_after_success: "/test-items",

                is_active: true,
                is_visible: false
            },
            {
                id: "test-item-details",
                parent_id: "test-item-list",
                sub_page_name: "Test Item Details",
                page_type: "details",
                slug: ":id",
                route: "/test-items/:id",
                description: "View complete test-item information.",
                icon: "Eye",

                api_url: "https://api.example.com/test-items/{id}",
                api_method: "GET",

                permission: "test_items.view",
                component: "TestItemDetails",

                is_active: true,
                is_visible: false
            },
            {
                id: "test-item-edit",
                parent_id: "test-item-list",
                sub_page_name: "Edit Test Item",
                page_type: "edit",
                slug: ":id/edit",
                route: "/test-items/:id/edit",
                description: "Update an existing test item.",
                icon: "Pencil",

                api_url: "https://api.example.com/test-items/{id}",
                api_method: "PUT",

                permission: "test_items.update",
                component: "TestItemForm",

                form_mode: "edit",
                load_existing_data: true,
                redirect_after_success: "/test-items/{id}",

                is_active: true,
                is_visible: false
            }
        ],

        metadata: {
            version: "1.0.0",
            created_by: "system",
            configuration_type: "dynamic_page",
            tags: ["test", "management", "configuration"]
        }
    }
] as const;

export default dashboard;
