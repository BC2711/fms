export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface PermissionConfig {
  all?: string[]
  any?: string[]
  roles?: string[]
}

export interface MenuConfig {
  id: string
  label: string
  path?: string
  route?: string
  icon?: string
  badge?: string | number
  type?: 'item' | 'divider' | 'group'
  is_visible?: boolean
  disabled?: boolean
  external?: boolean
  permissions?: PermissionConfig
  children?: MenuConfig[]
}

export type MenuItem = MenuConfig

export interface NavbarConfig {
  enabled: boolean
  fixed?: boolean
  logo?: string
  showThemeToggle?: boolean
  showUserMenu?: boolean
}

export interface SidebarConfig {
  enabled: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  width?: number
  items: MenuItem[]
}

export interface LayoutConfig {
  navbar: NavbarConfig
  sidebar: SidebarConfig
}

export interface ApplicationConfig {
  name: string
  title: string
  description?: string
  version?: string
  basePath?: string
  defaultRoute: string
  layout: LayoutConfig
  pages: PageConfig[]
}

export interface ApiEndpointConfig {
  path: string
  method: HttpMethod
  headers?: Record<string, string>
  requestMappingPath?: string
  responseMappingPath?: string
}

export interface ApiConfig {
  baseUrl?: string
  headers?: Record<string, string>
  endpoints: Record<string, ApiEndpointConfig>
  data_mapping?: DataMappingConfig
}

export interface DataMappingConfig {
  type: 'list' | 'item' | 'paginated'
  items?: string
  item?: string
  total?: string
  page?: string
  pageSize?: string
}

export type ActionType = 'create' | 'edit' | 'delete' | 'export' | 'refresh' | 'navigate'

export interface ActionConfig {
  id: string
  type: ActionType
  label: string
  icon?: string
  permission?: PermissionConfig
  endpoint?: string
  path?: string
  confirmation?: string
  format?: 'csv' | 'xlsx' | 'json'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  requires_confirmation?: boolean
  confirmation_title?: string
  success_message?: string
  error_message?: string
  redirect_after_success?: string
  disabled?: boolean
}

export interface TextColumnConfig {
  id: string
  type: 'text'
  header: string
  accessor: string
  sortable?: boolean
  searchable?: boolean
  visible?: boolean
}

export interface NumberColumnConfig {
  id: string
  type: 'number'
  header: string
  accessor: string
  sortable?: boolean
  searchable?: boolean
  visible?: boolean
  format?: 'decimal' | 'currency' | 'percent'
  currency?: string
}

export interface BadgeColumnConfig {
  id: string
  type: 'badge'
  header: string
  accessor: string
  sortable?: boolean
  searchable?: boolean
  visible?: boolean
  variants?: Record<string, string>
  options?: Record<string, 'success' | 'danger' | 'warning' | 'info'>
}

export interface DateTimeColumnConfig {
  id: string
  type: 'datetime'
  header: string
  accessor: string
  sortable?: boolean
  searchable?: boolean
  visible?: boolean
  format?: string
}

export interface ActionsColumnConfig {
  id: string
  type: 'actions'
  header: string
  actions: ActionConfig[]
  visible?: boolean
}

export type TableColumnConfig =
  | TextColumnConfig
  | NumberColumnConfig
  | BadgeColumnConfig
  | DateTimeColumnConfig
  | ActionsColumnConfig

export interface PaginationConfig {
  enabled: boolean
  pageSize: number
  pageSizeOptions?: number[]
}

export interface SortingConfig {
  enabled: boolean
  defaultColumn?: string
  defaultDirection?: 'asc' | 'desc'
}

export interface TableConfig {
  columns: TableColumnConfig[]
  rowKey: string
  pagination?: PaginationConfig
  sorting?: SortingConfig
  selectable?: boolean
  stickyHeader?: boolean
  striped?: boolean
}

export interface SelectOptionConfig {
  label: string
  value: string | number
}

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'url'
  | 'number'
  | 'select'
  | 'textarea'
  | 'date'
  | 'datetime'
  | 'checkbox'
  | 'radio'
  | 'hidden'
  | 'currency'
  | 'time'
  | 'file'

export interface FormFieldConfig {
  name: string
  type: FormFieldType
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: string | number | boolean
  default_value?: string | number | boolean
  section?: string
  rows?: number
  grid?: {
    columns: number
  }
  options?: SelectOptionConfig[]
  validation?: {
    min?: number
    max?: number
    min_length?: number
    max_length?: number
    pattern?: string
    message?: string
  }
}

export interface FormConfig {
  fields: FormFieldConfig[]
  layout?:
    | { type: 'rows' }
    | { type: 'columns'; columns: 1 | 2 | 3 | 4 }
  submitLabel?: string
  successPath?: string
  cancelPath?: string
  cancelEnabled?: boolean
  resetEnabled?: boolean
  cancelLabel?: string
  resetLabel?: string
}

export interface SearchFilterConfig {
  id: string
  type: 'search'
  label: string
  field: string
  query_parameter?: string
  placeholder?: string
}

export interface SelectFilterConfig {
  id: string
  type: 'select'
  label: string
  field: string
  query_parameter?: string
  options: SelectOptionConfig[]
}

export interface DateRangeFilterConfig {
  id: string
  type: 'date_range'
  label: string
  fromField: string
  toField: string
  from_query_parameter?: string
  to_query_parameter?: string
}

export type FilterConfig = SearchFilterConfig | SelectFilterConfig | DateRangeFilterConfig

export type StatisticVariant = 'blue' | 'green' | 'red' | 'yellow' | 'purple'

export interface StatisticConfig {
  id: string
  label: string
  value_field: string
  icon?: string
  trend_field?: string
  trend_label?: string
  variant?: StatisticVariant
  format?: 'number' | 'currency' | 'percent'
}

export interface WidgetGridConfig {
  columns: number
}

export interface StatisticWidgetConfig {
  id: string
  type: 'statistic'
  title: string
  dataPath: string
  icon?: string
  format?: 'number' | 'currency' | 'percent'
  statistics?: StatisticConfig[]
  endpointKey?: string
  grid?: WidgetGridConfig
  actions?: ActionConfig[]
}

export interface ChartWidgetConfig {
  id: string
  type: 'chart'
  title: string
  chartType: 'line' | 'bar' | 'pie' | 'area'
  dataPath: string
  categoryPath: string
  valuePaths: string[]
  endpointKey?: string
  grid?: WidgetGridConfig
  actions?: ActionConfig[]
}

export interface SimpleChartWidgetConfig {
  id: string
  type: 'line_chart' | 'bar_chart'
  title: string
  endpointKey?: string
  dataPath?: string
  grid?: WidgetGridConfig
  actions?: ActionConfig[]
}

export interface TableDashboardWidgetConfig {
  id: string
  type: 'table'
  title: string
  table: TableConfig
  dataPath: string
  endpointKey?: string
  grid?: WidgetGridConfig
  actions?: ActionConfig[]
}

export interface ListDashboardWidgetConfig {
  id: string
  type: 'list'
  title: string
  dataPath: string
  labelPath: string
  endpointKey?: string
  grid?: WidgetGridConfig
  actions?: ActionConfig[]
}

export interface CustomDashboardWidgetConfig {
  id: string
  type: 'custom'
  title: string
  componentKey: string
  endpointKey?: string
  dataPath?: string
  grid?: WidgetGridConfig
  actions?: ActionConfig[]
}

export type DashboardWidgetConfig = StatisticWidgetConfig | ChartWidgetConfig | SimpleChartWidgetConfig | TableDashboardWidgetConfig | ListDashboardWidgetConfig | CustomDashboardWidgetConfig

export interface StateMessageConfig {
  title: string
  description?: string
  icon?: string
}

export interface StateConfig {
  loading?: StateMessageConfig
  empty?: StateMessageConfig
  error?: StateMessageConfig
}

export interface AuthenticationConfig {
  required: boolean
}

export interface BreadcrumbConfig {
  label: string
  path: string
}

interface PageConfigBase {
  id: string
  parentId?: string
  order?: number
  layout?: 'application' | 'standalone'
  title: string
  page_title?: string
  description?: string
  path: string
  route?: string
  page_type?: 'dashboard' | 'list' | 'create' | 'edit' | 'details'
  sub_pages?: PageConfig[]
  authentication?: AuthenticationConfig
  permissions?: PermissionConfig
  actions?: ActionConfig[]
  page_actions?: ActionConfig[]
  breadcrumbs?: BreadcrumbConfig[]
  state?: StateConfig
}

export interface DashboardPageConfig extends PageConfigBase {
  type: 'dashboard'
  api?: ApiConfig
  widgets: DashboardWidgetConfig[]
}

export interface ListPageConfig extends PageConfigBase {
  type: 'list'
  api: ApiConfig
  table: TableConfig
  filters?: FilterConfig[]
  statistics?: DashboardWidgetConfig[]
}

export interface CreatePageConfig extends PageConfigBase {
  type: 'create'
  api: ApiConfig
  form: FormConfig
}

export interface EditPageConfig extends PageConfigBase {
  type: 'edit'
  api: ApiConfig
  form: FormConfig
  recordIdParam: string
}

export interface DetailsPageConfig extends PageConfigBase {
  type: 'details'
  api: ApiConfig
  recordIdParam: string
  fields: string[]
  sections?: DetailSectionConfig[]
}

export type DetailFieldType = 'text' | 'number' | 'date' | 'email' | 'url' | 'datetime' | 'badge' | 'boolean' | 'image' | 'file'

export interface DetailFieldConfig {
  key: string
  label: string
  type: DetailFieldType
  sensitive?: boolean
  copyable?: boolean
  badgeVariants?: Record<string, 'success' | 'danger' | 'warning' | 'info'>
}

export interface DetailSectionConfig {
  id: string
  title: string
  fields: DetailFieldConfig[]
}

export type PageConfig =
  | DashboardPageConfig
  | ListPageConfig
  | CreatePageConfig
  | EditPageConfig
  | DetailsPageConfig
