import type { MenuItem } from '@/types/configuration.types'

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function items(prefix: string, labels: string[]): MenuItem[] {
  return labels.map((label) => ({
    id: `${prefix}-${slug(label)}`,
    label,
    path: `/${prefix}/${slug(label)}`,
    icon: 'Circle',
  }))
}

function section(prefix: string, label: string, labels: string[]): MenuItem {
  return {
    id: prefix,
    label,
    path: `/${prefix}`,
    icon: 'FolderTree',
    children: items(prefix, labels),
  }
}

export const menuConfig = [
  {
    id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', children: [
      { id: 'dashboard-overview', label: 'Overview', path: '/dashboard', icon: 'LayoutDashboard' },
      ...items('dashboard', ['Executive Dashboard', 'Operations Dashboard', 'Sales Dashboard', 'Inventory Dashboard', 'Finance Dashboard', 'Fleet Dashboard', 'Station Performance', 'Compliance Dashboard']),
    ],
  },
  {
    id: 'accounts', label: 'Accounts', icon: 'Users',
    children: [
      { id: 'accounts-all', label: 'All Account Holders', path: '/accounts', icon: 'Users' },
      ...items('accounts', [
        'Oil Marketing Companies',
        'Corporate Companies',
        'Government Institutions',
        'NGOs',
        'Individuals',
        'Aggregators',
      ]),
    ],
  },
  {
    id: 'stations', label: 'Stations', icon: 'Fuel',
    children: items('stations', [
      'Stations',
      'Station Types',
      'Station Groups',
      'Station Attendants',
      'Station Price Boards',
      'Station Inspections',
      'Station Documents',
      'Station Performance',
    ]),
  },
  {
    id: 'fuel-operations', label: 'Fuel Operations', icon: 'Droplets',
    children: items('fuel-operations', [
      'Fuel Products', 'Product Categories', 'Fuel Pricing', 'Inventory Overview', 'Station Stock', 'Depot Stock', 'Tank Stock', 'Stock Receipts', 'Stock Issues', 'Stock Transfers', 'Stock Adjustments', 'Tank Readings', 'Dip Readings', 'Meter Readings', 'Physical Stock Counts', 'Stock Reconciliation', 'Fuel Losses and Gains', 'Low-Stock Alerts', 'Inventory Valuation',
    ]),
  },
  {
    id: 'requests-orders', label: 'Requests & Orders', icon: 'ShoppingCart', children: items('requests-orders', [
      'All Fuel Requests', 'Create Fuel Request', 'Draft Requests', 'Pending Requests', 'Approved Requests', 'Rejected Requests', 'Fulfilled Requests', 'All Orders', 'Create Order', 'Pending Orders', 'Processing Orders', 'Dispatched Orders', 'Delivered Orders', 'Cancelled Orders', 'Order Approvals', 'Fuel Allocations', 'Allocation Balances', 'Allocation Usage',
    ]),
  },
  {
    id: 'logistics', label: 'Logistics', icon: 'Truck', children: items('logistics', [
      'Logistics Dashboard', 'Depots', 'Warehouses', 'Delivery Requests', 'Delivery Orders', 'Dispatch Planning', 'Delivery Schedule', 'Active Deliveries', 'Delivery Routes', 'Tanker Trucks', 'Delivery Drivers', 'Loading Records', 'Offloading Records', 'Delivery Tracking', 'Proof of Delivery', 'Delivery Exceptions', 'Failed Deliveries', 'Completed Deliveries', 'Delivery Reconciliation',
    ]),
  },
  {
    id: 'fleet', label: 'Fleet', icon: 'Car', children: items('fleet', [
      'All Vehicles', 'Add Vehicle', 'Vehicle Categories', 'Vehicle Groups', 'Customer Vehicles', 'Delivery Vehicles', 'Tanker Trucks', 'Vehicle Documents', 'Vehicle Fuel Limits', 'Vehicle Allocations', 'Vehicle Transactions', 'Vehicle Maintenance', 'Vehicle Inspections', 'Vehicle Tracking', 'All Drivers', 'Driver Documents', 'Driver Licences', 'Driver Assignments', 'Driver Fuel Limits', 'Driver Restrictions', 'Driver PIN Management', 'Driver Performance',
    ]),
  },
  {
    id: 'cards-pos', label: 'Cards & POS', icon: 'CreditCard', children: [
      section('cards-pos-fuel-cards', 'Fuel Cards', ['Card Dashboard', 'Card Stock', 'Issue Card', 'Issued Cards', 'Unassigned Cards', 'Vehicle Cards', 'Driver Cards', 'Customer Cards', 'Card Limits', 'Card Restrictions', 'Card PIN Management', 'Activate Cards', 'Blocked Cards', 'Expired Cards', 'Lost or Stolen Cards', 'Card Replacements', 'Card Transactions', 'Card Reconciliation']),
      section('cards-pos-devices', 'POS Devices', ['POS Dashboard', 'POS Devices', 'Add POS Device', 'POS Inventory', 'POS Assignments', 'Assign Device', 'Unassign Device', 'Station POS Devices', 'Attendant POS Devices', 'POS Transactions', 'POS Settlements', 'POS Reconciliation', 'POS Device Health', 'POS Maintenance', 'Lost or Damaged Devices']),
      section('cards-pos-attendants', 'Forecourt Attendants', ['All Attendants', 'Pending Activation', 'Active Attendants', 'Suspended Attendants', 'Station Assignments', 'Pump Assignments', 'Shift Assignments', 'POS Assignments', 'Attendant Transactions', 'Attendant Performance', 'Attendant Reconciliation']),
    ],
  },
  {
    id: 'finance', label: 'Finance', icon: 'Landmark', children: [
      section('finance-transactions', 'Transactions', ['Transaction Dashboard', 'All Transactions', 'Fuel Sales', 'Card Transactions', 'POS Transactions', 'Cash Transactions', 'Mobile Money Transactions', 'Bank Transactions', 'Credit Transactions', 'Debit Transactions', 'Failed Transactions', 'Refunds', 'Reversals', 'Transaction Approvals', 'Transaction Reconciliation']),
      section('finance-funding', 'Account Funding', ['Funding Dashboard', 'Top Up Account', 'Bulk Top Up', 'Debit Account', 'Bulk Debit', 'Credit Requests', 'Debit Requests', 'Funding Approvals', 'Balance Adjustments', 'Funding History']),
      section('finance-payments', 'Payments & Billing', ['All Payments', 'Customer Payments', 'Supplier Payments', 'Payment Requests', 'Payment Approvals', 'Failed Payments', 'Payment Reconciliation', 'Invoices', 'Proforma Invoices', 'Receipts', 'Credit Notes', 'Debit Notes', 'Customer Statements', 'Outstanding Balances', 'Overdue Invoices']),
      {
        id: 'finance-banking', label: 'Banking', path: '/finance-banking', icon: 'Landmark', children: [
          { id: 'banks', label: 'Banks', path: '/banks', icon: 'Landmark' },
          ...items('finance-banking', ['Bank Branches', 'Bank Accounts', 'Bank Deposits', 'Deposit References', 'Bank Transfers', 'Bank Statements', 'Bank Reconciliation', 'Payment Providers', 'Mobile Money Providers']),
        ],
      },
    ],
  },
  {
    id: 'compliance', label: 'Compliance', icon: 'ShieldCheck', children: items('compliance', [
      'Compliance Dashboard', 'KYC Verification', 'KYB Verification', 'Customer Risk Profiles', 'Transaction Monitoring', 'Suspicious Transactions', 'Fuel Variance Investigations', 'Regulatory Reports', 'Licence Management', 'Insurance Management', 'Risk Register', 'Compliance Inspections', 'Compliance Incidents', 'Fraud Reports', 'Audit Logs', 'User Activity Logs', 'Security Events', 'Login Attempts',
    ]),
  },
  {
    id: 'reports', label: 'Reports', icon: 'ChartNoAxesCombined', children: items('reports', [
      'Reports Dashboard', 'Sales Reports', 'Transaction Reports', 'Fuel Consumption Reports', 'Inventory Reports', 'Station Reports', 'Customer Reports', 'OMC Reports', 'Vehicle Reports', 'Driver Reports', 'Card Reports', 'POS Reports', 'Delivery Reports', 'Payment Reports', 'Financial Reports', 'Reconciliation Reports', 'Variance Reports', 'Compliance Reports', 'Audit Reports', 'Performance Analytics', 'Forecasting', 'KPI Dashboard', 'Custom Report Builder', 'Scheduled Reports', 'Download Centre',
    ]),
  },
  {
    id: 'administration', label: 'Administration', icon: 'Settings',
    children: items('administration', [
      'All Users',
      'Roles',
      'Permissions',
      'Permission Groups',
      'Menu Permissions',
      'Page Permissions',
      'Route Permissions',
      'Data-Scope Permissions',
      'User Sessions',
      'Login History',
      'Countries',
      'Provinces',
      'Districts',
      'Cities and Towns',
      'Station Regions'
    ]),
  },
  {
    id: 'settings', label: 'Settings', icon: 'SlidersHorizontal', children: [
      section('settings-general', 'General Settings', ['System Information', 'Company Profile', 'Branding', 'Logo and Favicon', 'Languages', 'Currency', 'Date and Time', 'Numbering Sequences']),
      section('settings-interface', 'Interface Settings', ['Theme Settings', 'Layout Settings', 'Mac Sidebar Settings', 'Windows Navbar Settings', 'Default Layout', 'Sidebar Behaviour', 'Menu Appearance', 'Dashboard Preferences']),
      section('settings-operational', 'Operational Settings', ['Fuel Settings', 'Inventory Settings', 'Station Settings', 'Transaction Settings', 'Payment Settings', 'Pricing Settings', 'Approval Workflows', 'Document Settings', 'Notification Settings']),
      section('settings-security', 'Security Settings', ['Password Policies', 'Two-Factor Authentication', 'Session Settings', 'Login Restrictions', 'API Security', 'Rate Limits', 'Feature Flags']),
      section('settings-integrations', 'Integrations', ['Banking Integrations', 'Mobile Money Integrations', 'Payment Gateways', 'POS Integrations', 'Fuel Pump Integrations', 'GPS Integrations', 'Email Integration', 'SMS Integration', 'Accounting Integration', 'API Clients', 'API Credentials', 'Webhooks', 'Integration Logs']),
      section('settings-system', 'System Management', ['System Health', 'Service Status', 'Database Status', 'Cache Status', 'Background Jobs', 'Error Logs', 'Application Logs', 'Storage Usage', 'Data Imports', 'Data Exports', 'Backup Management', 'Restore Management', 'Seed Data']),
    ],
  },
  {
    id: 'my-account', label: 'My Account', icon: 'CircleUserRound', children: items('my-account', [
      'My Dashboard', 'My Profile', 'My Organization', 'My Vehicles', 'My Drivers', 'My Fuel Cards', 'My Fuel Requests', 'My Orders', 'My Deliveries', 'My Transactions', 'My Payments', 'My Invoices', 'My Statements', 'My Documents', 'My Notifications', 'My Support Tickets', 'Change Password', 'Security Settings', 'Logout',
    ]),
  },
] satisfies MenuItem[]
