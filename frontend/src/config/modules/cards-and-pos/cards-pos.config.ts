import { createFuelOperationPage, type FuelOperationDefinition, type FuelOperationField } from '@/config/modules/fuel-operation/fuel-operation-page-factory'

const roots = {
  cards: import.meta.env.VITE_API_ROUTE_CARDS_POS_FUEL_CARDS || '/cards-pos-fuel-cards',
  devices: import.meta.env.VITE_API_ROUTE_CARDS_POS_DEVICES || '/cards-pos-devices',
  attendants: import.meta.env.VITE_API_ROUTE_CARDS_POS_ATTENDANTS || '/cards-pos-attendants',
}
const field = (name: string, label: string, type: FuelOperationField['type'] = 'text', required = false): FuelOperationField => ({ name, label, type, required })
const identity = (nameLabel: string, codeLabel = 'Reference') => [field('name', nameLabel, 'text', true), field('code', codeLabel, 'text', true)]
const card = [field('card_id', 'Card ID', 'number', true), field('card_number', 'Card Number'), field('card_type', 'Card Type')]
const device = [field('device_id', 'Device ID', 'number', true), field('serial_number', 'Serial Number'), field('device_model', 'Device Model')]
const attendant = [field('attendant_id', 'Attendant ID', 'number', true), field('attendant_name', 'Attendant Name'), field('employee_number', 'Employee Number')]
const def = (group: keyof typeof roots, slug: string, title: string, fields: FuelOperationField[], options: Partial<FuelOperationDefinition> = {}): FuelOperationDefinition => ({ slug, title, description: `Manage and review ${title.toLowerCase()}.`, fields, routeRoot: roots[group], idPrefix: group === 'cards' ? 'cards-pos-fuel-cards' : group === 'devices' ? 'cards-pos-devices' : 'cards-pos-attendants', icon: 'Circle', ...options })

const cardFields = [...identity('Fuel Card', 'Card Number'), field('card_type', 'Card Type'), field('account_id', 'Account ID', 'number'), field('vehicle_id', 'Vehicle ID', 'number'), field('driver_id', 'Driver ID', 'number'), field('issue_date', 'Issue Date', 'date'), field('expiry_date', 'Expiry Date', 'date'), field('balance', 'Balance', 'currency')]
const deviceFields = [...identity('POS Device', 'Serial Number'), field('device_model', 'Device Model'), field('terminal_id', 'Terminal ID'), field('station_id', 'Station ID', 'number'), field('attendant_id', 'Attendant ID', 'number'), field('commissioned_date', 'Commissioned Date', 'date')]
const attendantFields = [...identity('Attendant Name', 'Employee Number'), field('station_id', 'Station ID', 'number'), field('phone', 'Phone'), field('email', 'Email', 'email'), field('activation_date', 'Activation Date', 'date'), field('shift', 'Shift')]

const definitions: FuelOperationDefinition[] = [
  def('cards', 'card-dashboard', 'Card Dashboard', [...identity('Metric', 'Metric Code'), field('total_cards', 'Total Cards', 'number'), field('issued_cards', 'Issued Cards', 'number'), field('blocked_cards', 'Blocked Cards', 'number')], { readOnly: true }),
  def('cards', 'card-stock', 'Card Stock', cardFields, { createSlug: 'issue-card', createId: 'cards-pos-fuel-cards-issue-card' }),
  def('cards', 'issued-cards', 'Issued Cards', cardFields, { readOnly: true }),
  def('cards', 'unassigned-cards', 'Unassigned Cards', cardFields, { readOnly: true }),
  def('cards', 'vehicle-cards', 'Vehicle Cards', [...cardFields, field('registration_number', 'Vehicle Registration')], { readOnly: true }),
  def('cards', 'driver-cards', 'Driver Cards', [...cardFields, field('driver_name', 'Driver')], { readOnly: true }),
  def('cards', 'customer-cards', 'Customer Cards', [...cardFields, field('customer_name', 'Customer')], { readOnly: true }),
  def('cards', 'card-limits', 'Card Limits', [...identity('Card Limit', 'Limit Reference'), ...card, field('daily_limit', 'Daily Limit', 'currency'), field('monthly_limit', 'Monthly Limit', 'currency'), field('quantity_limit', 'Quantity Limit', 'number')]),
  def('cards', 'card-restrictions', 'Card Restrictions', [...identity('Restriction', 'Restriction Reference'), ...card, field('restriction_type', 'Restriction Type', 'text', true), field('restriction_value', 'Restriction Value'), field('start_date', 'Start Date', 'date'), field('end_date', 'End Date', 'date')]),
  def('cards', 'card-pin-management', 'Card PIN Management', [...identity('PIN Record', 'PIN Reference'), ...card, field('pin_status', 'PIN Status'), field('issued_date', 'Issued Date', 'datetime'), field('reset_required', 'Reset Required')]),
  def('cards', 'activate-cards', 'Activate Cards', [...identity('Activation', 'Activation Reference'), ...card, field('activation_date', 'Activation Date', 'datetime'), field('activated_by', 'Activated By')]),
  def('cards', 'blocked-cards', 'Blocked Cards', [...cardFields, field('blocked_date', 'Blocked Date', 'datetime'), field('block_reason', 'Block Reason')], { readOnly: true }),
  def('cards', 'expired-cards', 'Expired Cards', cardFields, { readOnly: true }),
  def('cards', 'lost-or-stolen-cards', 'Lost or Stolen Cards', [...identity('Card Incident', 'Incident Reference'), ...card, field('incident_type', 'Incident Type'), field('reported_date', 'Reported Date', 'datetime'), field('notes', 'Notes', 'textarea')]),
  def('cards', 'card-replacements', 'Card Replacements', [...identity('Replacement', 'Replacement Reference'), field('old_card_id', 'Old Card ID', 'number', true), field('new_card_id', 'New Card ID', 'number'), field('replacement_reason', 'Reason', 'textarea'), field('replacement_date', 'Replacement Date', 'date')]),
  def('cards', 'card-transactions', 'Card Transactions', [...identity('Transaction', 'Transaction Reference'), ...card, field('transaction_date', 'Transaction Date', 'datetime'), field('station', 'Station'), field('quantity', 'Quantity', 'number'), field('amount', 'Amount', 'currency')], { readOnly: true }),
  def('cards', 'card-reconciliation', 'Card Reconciliation', [...identity('Reconciliation', 'Reconciliation Reference'), ...card, field('opening_balance', 'Opening Balance', 'currency'), field('transaction_total', 'Transaction Total', 'currency'), field('closing_balance', 'Closing Balance', 'currency'), field('variance', 'Variance', 'currency')], { readOnly: true }),

  def('devices', 'pos-dashboard', 'POS Dashboard', [...identity('Metric', 'Metric Code'), field('total_devices', 'Total Devices', 'number'), field('online_devices', 'Online Devices', 'number'), field('offline_devices', 'Offline Devices', 'number')], { readOnly: true }),
  def('devices', 'pos-devices', 'POS Devices', deviceFields, { createSlug: 'add-pos-device', createId: 'cards-pos-devices-add-pos-device' }),
  def('devices', 'pos-inventory', 'POS Inventory', [...deviceFields, field('warehouse', 'Warehouse'), field('received_date', 'Received Date', 'date')]),
  def('devices', 'pos-assignments', 'POS Assignments', [...identity('Assignment', 'Assignment Reference'), ...device, field('station_id', 'Station ID', 'number'), field('attendant_id', 'Attendant ID', 'number'), field('assigned_date', 'Assigned Date', 'date')], { createSlug: 'assign-device', createId: 'cards-pos-devices-assign-device' }),
  def('devices', 'unassign-device', 'Unassign Device', [...identity('Unassignment', 'Unassignment Reference'), ...device, field('unassigned_date', 'Unassigned Date', 'date'), field('reason', 'Reason', 'textarea')]),
  def('devices', 'station-pos-devices', 'Station POS Devices', [...deviceFields, field('station_name', 'Station')], { readOnly: true }),
  def('devices', 'attendant-pos-devices', 'Attendant POS Devices', [...deviceFields, field('attendant_name', 'Attendant')], { readOnly: true }),
  def('devices', 'pos-transactions', 'POS Transactions', [...identity('Transaction', 'Transaction Reference'), ...device, field('transaction_date', 'Transaction Date', 'datetime'), field('amount', 'Amount', 'currency'), field('response_code', 'Response Code')], { readOnly: true }),
  def('devices', 'pos-settlements', 'POS Settlements', [...identity('Settlement', 'Settlement Reference'), ...device, field('settlement_date', 'Settlement Date', 'date'), field('transaction_count', 'Transaction Count', 'number'), field('gross_amount', 'Gross Amount', 'currency'), field('net_amount', 'Net Amount', 'currency')]),
  def('devices', 'pos-reconciliation', 'POS Reconciliation', [...identity('Reconciliation', 'Reconciliation Reference'), ...device, field('system_total', 'System Total', 'currency'), field('settled_total', 'Settled Total', 'currency'), field('variance', 'Variance', 'currency')], { readOnly: true }),
  def('devices', 'pos-device-health', 'POS Device Health', [...deviceFields, field('connectivity', 'Connectivity'), field('battery_level', 'Battery Level', 'number'), field('last_seen', 'Last Seen', 'datetime')], { readOnly: true }),
  def('devices', 'pos-maintenance', 'POS Maintenance', [...identity('Maintenance Job', 'Job Number'), ...device, field('maintenance_type', 'Maintenance Type'), field('scheduled_date', 'Scheduled Date', 'date'), field('completed_date', 'Completed Date', 'date'), field('notes', 'Notes', 'textarea')]),
  def('devices', 'lost-or-damaged-devices', 'Lost or Damaged Devices', [...identity('Device Incident', 'Incident Reference'), ...device, field('incident_type', 'Incident Type'), field('reported_date', 'Reported Date', 'datetime'), field('description', 'Description', 'textarea')]),

  def('attendants', 'all-attendants', 'All Attendants', attendantFields),
  def('attendants', 'pending-activation', 'Pending Activation', attendantFields, { readOnly: true }),
  def('attendants', 'active-attendants', 'Active Attendants', attendantFields, { readOnly: true }),
  def('attendants', 'suspended-attendants', 'Suspended Attendants', attendantFields, { readOnly: true }),
  def('attendants', 'station-assignments', 'Station Assignments', [...identity('Station Assignment'), ...attendant, field('station_id', 'Station ID', 'number', true), field('start_date', 'Start Date', 'date'), field('end_date', 'End Date', 'date')]),
  def('attendants', 'pump-assignments', 'Pump Assignments', [...identity('Pump Assignment'), ...attendant, field('pump_id', 'Pump ID', 'number', true), field('assignment_date', 'Assignment Date', 'date')]),
  def('attendants', 'shift-assignments', 'Shift Assignments', [...identity('Shift Assignment'), ...attendant, field('shift_name', 'Shift'), field('start_time', 'Start Time'), field('end_time', 'End Time'), field('assignment_date', 'Assignment Date', 'date')]),
  def('attendants', 'pos-assignments', 'Attendant POS Assignments', [...identity('POS Assignment'), ...attendant, ...device, field('assigned_date', 'Assigned Date', 'date')]),
  def('attendants', 'attendant-transactions', 'Attendant Transactions', [...identity('Transaction', 'Transaction Reference'), ...attendant, field('transaction_date', 'Transaction Date', 'datetime'), field('transaction_count', 'Transaction Count', 'number'), field('amount', 'Amount', 'currency')], { readOnly: true }),
  def('attendants', 'attendant-performance', 'Attendant Performance', [...identity('Performance', 'Performance Reference'), ...attendant, field('period', 'Period'), field('transaction_count', 'Transactions', 'number'), field('sales_amount', 'Sales Amount', 'currency'), field('performance_score', 'Performance Score', 'number')], { readOnly: true }),
  def('attendants', 'attendant-reconciliation', 'Attendant Reconciliation', [...identity('Reconciliation', 'Reconciliation Reference'), ...attendant, field('shift_date', 'Shift Date', 'date'), field('system_total', 'System Total', 'currency'), field('declared_total', 'Declared Total', 'currency'), field('variance', 'Variance', 'currency')], { readOnly: true }),
]

export const cardsPosConfigs = definitions.map(createFuelOperationPage)
export const cardsPosPageRegistry = Object.fromEntries(cardsPosConfigs.map((page) => [page.id, page]))
