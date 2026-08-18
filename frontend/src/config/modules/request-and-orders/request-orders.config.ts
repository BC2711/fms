import { createFuelOperationPage, type FuelOperationDefinition, type FuelOperationField } from '@/config/modules/fuel-operation/fuel-operation-page-factory'

const routeRoot = import.meta.env.VITE_API_ROUTE_REQUESTS_ORDERS || '/requests-orders'
const field = (name: string, label: string, type: FuelOperationField['type'] = 'text', required = false): FuelOperationField => ({ name, label, type, required })
const requestFields = [field('name', 'Request Title', 'text', true), field('code', 'Request Number', 'text', true), field('account_id', 'Account ID', 'number', true), field('request_date', 'Request Date', 'date', true), field('required_date', 'Required Date', 'date'), field('total_quantity', 'Total Quantity', 'number'), field('total_amount', 'Total Amount', 'currency'), field('purpose', 'Purpose', 'textarea')]
const orderFields = [field('name', 'Order Title', 'text', true), field('code', 'Order Number', 'text', true), field('fuel_request_id', 'Fuel Request ID', 'number'), field('supplier_id', 'Supplier ID', 'number'), field('order_date', 'Order Date', 'date', true), field('delivery_date', 'Delivery Date', 'date'), field('total_quantity', 'Total Quantity', 'number'), field('total_amount', 'Total Amount', 'currency')]
const approvalFields = [field('name', 'Approval Name', 'text', true), field('code', 'Approval Reference', 'text', true), field('fuel_order_id', 'Fuel Order ID', 'number'), field('approver_id', 'Approver ID', 'number'), field('decision', 'Decision'), field('approval_date', 'Approval Date', 'datetime'), field('comments', 'Comments', 'textarea')]
const allocationFields = [field('name', 'Allocation Name', 'text', true), field('code', 'Allocation Reference', 'text', true), field('account_id', 'Account ID', 'number', true), field('product_id', 'Fuel Product ID', 'number', true), field('allocated_quantity', 'Allocated Quantity', 'number', true), field('used_quantity', 'Used Quantity', 'number'), field('start_date', 'Start Date', 'date'), field('end_date', 'End Date', 'date')]

const definition = (slug: string, title: string, description: string, fields: FuelOperationField[], options: Partial<FuelOperationDefinition> = {}): FuelOperationDefinition => ({ slug, title, description, fields, routeRoot, idPrefix: 'requests-orders', icon: 'Circle', ...options })
const definitions: FuelOperationDefinition[] = [
  definition('all-fuel-requests', 'All Fuel Requests', 'Manage fuel requests across all accounts and workflow states.', requestFields, { createSlug: 'create-fuel-request', createId: 'requests-orders-create-fuel-request' }),
  definition('draft-requests', 'Draft Requests', 'Review fuel requests that have not yet been submitted.', requestFields, { readOnly: true }),
  definition('pending-requests', 'Pending Requests', 'Review fuel requests awaiting approval.', requestFields, { readOnly: true }),
  definition('approved-requests', 'Approved Requests', 'Review approved fuel requests.', requestFields, { readOnly: true }),
  definition('rejected-requests', 'Rejected Requests', 'Review rejected fuel requests and decisions.', requestFields, { readOnly: true }),
  definition('fulfilled-requests', 'Fulfilled Requests', 'Review fuel requests that have been fully supplied.', requestFields, { readOnly: true }),
  definition('all-orders', 'All Orders', 'Manage fuel orders across the complete fulfilment lifecycle.', orderFields, { createSlug: 'create-order', createId: 'requests-orders-create-order' }),
  definition('pending-orders', 'Pending Orders', 'Review orders awaiting processing.', orderFields, { readOnly: true }),
  definition('processing-orders', 'Processing Orders', 'Monitor orders currently being prepared.', orderFields, { readOnly: true }),
  definition('dispatched-orders', 'Dispatched Orders', 'Monitor orders dispatched for delivery.', orderFields, { readOnly: true }),
  definition('delivered-orders', 'Delivered Orders', 'Review successfully delivered orders.', orderFields, { readOnly: true }),
  definition('cancelled-orders', 'Cancelled Orders', 'Review cancelled fuel orders.', orderFields, { readOnly: true }),
  definition('order-approvals', 'Order Approvals', 'Manage approval decisions for fuel orders.', approvalFields),
  definition('fuel-allocations', 'Fuel Allocations', 'Manage fuel allocations assigned to accounts.', allocationFields),
  definition('allocation-balances', 'Allocation Balances', 'Review remaining balances for active fuel allocations.', [...allocationFields, field('remaining_quantity', 'Remaining Quantity', 'number'), field('remaining_value', 'Remaining Value', 'currency')], { readOnly: true }),
  definition('allocation-usage', 'Allocation Usage', 'Review fuel allocation consumption and utilization.', [...allocationFields, field('usage_date', 'Usage Date', 'date'), field('usage_percentage', 'Usage Percentage', 'number')], { readOnly: true }),
]

export const requestOrderConfigs = definitions.map(createFuelOperationPage)
export const requestOrderPageRegistry = Object.fromEntries(requestOrderConfigs.map((page) => [page.id, page]))
