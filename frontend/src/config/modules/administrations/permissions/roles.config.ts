import { administrationSubPage, createAdministrationPage } from '@/config/modules/administrations/administration-page-factory'

export const rolesListConfig = createAdministrationPage('roles', 'Roles')
rolesListConfig.table.columns = [
  { id: 'name', type: 'text', header: 'Role', accessor: 'name', sortable: true, searchable: true },
  { id: 'permissions', type: 'number', header: 'Permissions', accessor: 'permissions.length' },
  { id: 'actions', type: 'actions', header: 'Actions', actions: [
    { id: 'view', type: 'navigate', label: 'View', icon: 'Eye', path: '/administration/roles/{id}' },
    { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil', path: '/administration/roles/{id}/edit' },
    { id: 'delete', type: 'delete', label: 'Delete', icon: 'Trash2', endpoint: '/administration/roles/{id}', requires_confirmation: true },
  ] },
]
const roleForm = { layout: { type: 'columns' as const, columns: 1 as const }, cancelPath: '/administration/roles', resetEnabled: true, fields: [
  { name: 'name', type: 'text' as const, label: 'Role Name', required: true },
  { name: 'permission_ids', type: 'textarea' as const, label: 'Permission IDs', description: 'Comma-separated permission IDs. View available IDs on the Permissions page.', rows: 5 },
] }
rolesListConfig.sub_pages?.forEach((page) => {
  if (page.type === 'create' || page.type === 'edit') page.form = { ...roleForm, submitLabel: page.type === 'create' ? 'Create Role' : 'Save Role' }
  if (page.type === 'details') {
    page.fields = ['name', 'permissions']
    page.sections = [{ id: 'role', title: 'Role Information', fields: [{ key: 'name', label: 'Role', type: 'text' }, { key: 'permissions', label: 'Permissions', type: 'text' }] }]
  }
})
export const rolesCreateConfig = administrationSubPage(rolesListConfig, 'create')
export const rolesDetailsConfig = administrationSubPage(rolesListConfig, 'details')
export const rolesEditConfig = administrationSubPage(rolesListConfig, 'edit')
