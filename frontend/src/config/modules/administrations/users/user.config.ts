import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const usersListConfig = createAdministrationPage('all-users', 'All Users')
usersListConfig.table.columns = [
  { id: 'full-name', type: 'text', header: 'Name', accessor: 'full_name', sortable: true, searchable: true },
  { id: 'email', type: 'text', header: 'Email', accessor: 'email', sortable: true, searchable: true },
  { id: 'role', type: 'text', header: 'Role', accessor: 'roles.0.name' },
  { id: 'status', type: 'badge', header: 'Status', accessor: 'status', sortable: true, options: { active: 'success', inactive: 'danger', suspended: 'warning' } },
  { id: 'created', type: 'datetime', header: 'Created', accessor: 'created_at', sortable: true },
  { id: 'actions', type: 'actions', header: 'Actions', actions: [
    { id: 'view', type: 'navigate', label: 'View', icon: 'Eye', path: '/administration/all-users/{id}' },
    { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil', path: '/administration/all-users/{id}/edit' },
    { id: 'delete', type: 'delete', label: 'Delete', icon: 'Trash2', endpoint: '/administration/all-users/{id}', requires_confirmation: true },
  ] },
]
const userForm = {
  layout: { type: 'columns' as const, columns: 2 as const }, cancelPath: '/administration/all-users', resetEnabled: true,
  fields: [
    { name: 'full_name', type: 'text' as const, label: 'Full Name', required: true },
    { name: 'email', type: 'email' as const, label: 'Email Address', required: true },
    { name: 'password', type: 'password' as const, label: 'Password', description: 'Required for new users; leave blank when editing to keep the current password.' },
    { name: 'role_id', type: 'select' as const, label: 'Role', options: [], options_endpoint: '/administration/roles', option_label: 'name', option_value: 'id' },
    { name: 'is_superuser', type: 'checkbox' as const, label: 'System Administrator' },
    { name: 'status', type: 'select' as const, label: 'Status', default_value: 'active', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Suspended', value: 'suspended' }] },
  ],
}
usersListConfig.sub_pages?.forEach((page) => {
  if (page.type === 'create' || page.type === 'edit') page.form = { ...userForm, submitLabel: page.type === 'create' ? 'Create User' : 'Save User' }
  if (page.type === 'details') {
    page.fields = ['full_name', 'email', 'roles.0.name', 'status', 'is_superuser', 'created_at']
    page.sections = [{ id: 'user', title: 'User Information', fields: [
      { key: 'full_name', label: 'Full Name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' },
      { key: 'roles.0.name', label: 'Role', type: 'text' }, { key: 'status', label: 'Status', type: 'badge' },
      { key: 'is_superuser', label: 'System Administrator', type: 'boolean' }, { key: 'created_at', label: 'Created', type: 'datetime' },
    ] }]
  }
})
export const usersCreateConfig = administrationSubPage(usersListConfig, 'create')
export const usersDetailsConfig = administrationSubPage(usersListConfig, 'details')
export const usersEditConfig = administrationSubPage(usersListConfig, 'edit')
