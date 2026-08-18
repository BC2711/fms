import { createFuelOperationPage, type FuelOperationDefinition, type FuelOperationField } from '@/config/modules/fuel-operation/fuel-operation-page-factory'

const roots = {
  transactions: import.meta.env.VITE_API_ROUTE_FINANCE_TRANSACTIONS || '/finance-transactions',
  funding: import.meta.env.VITE_API_ROUTE_FINANCE_FUNDING || '/finance-funding',
  payments: import.meta.env.VITE_API_ROUTE_FINANCE_PAYMENTS || '/finance-payments',
  banking: import.meta.env.VITE_API_ROUTE_FINANCE_BANKING || '/finance-banking',
}
const field = (name: string, label: string, type: FuelOperationField['type'] = 'text', required = false): FuelOperationField => ({ name, label, type, required })
const identity = (nameLabel: string, codeLabel = 'Reference') => [field('name', nameLabel, 'text', true), field('code', codeLabel, 'text', true)]
const transactionFields = [...identity('Transaction', 'Transaction Reference'), field('account_id', 'Account ID', 'number'), field('transaction_type', 'Transaction Type'), field('transaction_date', 'Transaction Date', 'datetime', true), field('amount', 'Amount', 'currency', true), field('payment_method', 'Payment Method'), field('description', 'Description', 'textarea')]
const fundingFields = [...identity('Funding Record', 'Funding Reference'), field('account_id', 'Account ID', 'number', true), field('funding_type', 'Funding Type'), field('amount', 'Amount', 'currency', true), field('request_date', 'Request Date', 'date'), field('approved_by', 'Approved By'), field('notes', 'Notes', 'textarea')]
const paymentFields = [...identity('Payment Record', 'Payment Reference'), field('account_id', 'Account ID', 'number'), field('invoice_id', 'Invoice ID', 'number'), field('payment_date', 'Payment Date', 'date'), field('due_date', 'Due Date', 'date'), field('amount', 'Amount', 'currency', true), field('payment_method', 'Payment Method')]
const bankingFields = [...identity('Banking Record', 'Banking Reference'), field('bank_id', 'Bank ID', 'number'), field('account_number', 'Account Number'), field('transaction_date', 'Transaction Date', 'date'), field('amount', 'Amount', 'currency'), field('currency', 'Currency'), field('description', 'Description', 'textarea')]
type Group = keyof typeof roots
const groupFields: Record<Group, FuelOperationField[]> = { transactions: transactionFields, funding: fundingFields, payments: paymentFields, banking: bankingFields }
const def = (group: Group, slug: string, title: string, readOnly = false): FuelOperationDefinition => ({ slug, title, description: `Manage and review ${title.toLowerCase()}.`, fields: groupFields[group], routeRoot: roots[group], idPrefix: `finance-${group}`, icon: 'Circle', readOnly })

const transactionEntries: [string, string, boolean?][] = [
  ['transaction-dashboard', 'Transaction Dashboard', true], ['all-transactions', 'All Transactions', true], ['fuel-sales', 'Fuel Sales', true],
  ['card-transactions', 'Card Transactions', true], ['pos-transactions', 'POS Transactions', true], ['cash-transactions', 'Cash Transactions', true],
  ['mobile-money-transactions', 'Mobile Money Transactions', true], ['bank-transactions', 'Bank Transactions', true], ['credit-transactions', 'Credit Transactions', true],
  ['debit-transactions', 'Debit Transactions', true], ['failed-transactions', 'Failed Transactions', true], ['refunds', 'Refunds'], ['reversals', 'Reversals'],
  ['transaction-approvals', 'Transaction Approvals'], ['transaction-reconciliation', 'Transaction Reconciliation', true],
]
const fundingEntries: [string, string, boolean?][] = [
  ['funding-dashboard', 'Funding Dashboard', true], ['top-up-account', 'Top Up Account'], ['bulk-top-up', 'Bulk Top Up'], ['debit-account', 'Debit Account'],
  ['bulk-debit', 'Bulk Debit'], ['credit-requests', 'Credit Requests'], ['debit-requests', 'Debit Requests'], ['funding-approvals', 'Funding Approvals'],
  ['balance-adjustments', 'Balance Adjustments'], ['funding-history', 'Funding History', true],
]
const paymentEntries: [string, string, boolean?][] = [
  ['all-payments', 'All Payments', true], ['customer-payments', 'Customer Payments'], ['supplier-payments', 'Supplier Payments'],
  ['payment-requests', 'Payment Requests'], ['payment-approvals', 'Payment Approvals'], ['failed-payments', 'Failed Payments', true],
  ['payment-reconciliation', 'Payment Reconciliation', true], ['invoices', 'Invoices'], ['proforma-invoices', 'Proforma Invoices'], ['receipts', 'Receipts'],
  ['credit-notes', 'Credit Notes'], ['debit-notes', 'Debit Notes'], ['customer-statements', 'Customer Statements', true],
  ['outstanding-balances', 'Outstanding Balances', true], ['overdue-invoices', 'Overdue Invoices', true],
]
const bankingEntries: [string, string, boolean?][] = [
  ['bank-branches', 'Bank Branches'], ['bank-accounts', 'Bank Accounts'], ['bank-deposits', 'Bank Deposits'], ['deposit-references', 'Deposit References'],
  ['bank-transfers', 'Bank Transfers'], ['bank-statements', 'Bank Statements', true], ['bank-reconciliation', 'Bank Reconciliation', true],
  ['payment-providers', 'Payment Providers'], ['mobile-money-providers', 'Mobile Money Providers'],
]

export const financeConfigs = [
  ...transactionEntries.map(([slug, title, readOnly]) => def('transactions', slug, title, readOnly)),
  ...fundingEntries.map(([slug, title, readOnly]) => def('funding', slug, title, readOnly)),
  ...paymentEntries.map(([slug, title, readOnly]) => def('payments', slug, title, readOnly)),
  ...bankingEntries.map(([slug, title, readOnly]) => def('banking', slug, title, readOnly)),
].map(createFuelOperationPage)

export const financePageRegistry = Object.fromEntries(financeConfigs.map((page) => [page.id, page]))
