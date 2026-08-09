import { Check, Copy, Download, Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'

import { Badge, type BadgeVariant } from '@/components/data-display/Badge'
import type { DetailFieldConfig } from '@/types/configuration.types'

function defaultVariant(value: string): BadgeVariant {
  if (value === 'active' || value === 'success') return 'success'
  if (value === 'inactive' || value === 'error') return 'danger'
  if (value === 'draft' || value === 'pending') return 'warning'
  return 'info'
}

function displayValue(field: DetailFieldConfig, value: unknown) {
  if (value === undefined || value === null || value === '') return <span className="text-gray-400">—</span>
  if (field.type === 'datetime') { const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
  if (field.type === 'badge') { const label = String(value); return <Badge label={label} variant={field.badgeVariants?.[label] ?? defaultVariant(label)} /> }
  if (field.type === 'boolean') return <span className="inline-flex items-center gap-1">{Boolean(value) ? <Check size={16} className="text-green-600" /> : <X size={16} className="text-red-600" />}{Boolean(value) ? 'Yes' : 'No'}</span>
  if (field.type === 'image') return <img src={String(value)} alt={field.label} className="h-16 w-16 rounded-lg object-cover" />
  if (field.type === 'file') return <a href={String(value)} download className="inline-flex items-center gap-1 text-blue-600 hover:underline"><Download size={15} />Download file</a>
  return String(value)
}

export function DetailField({ field, value }: { field: DetailFieldConfig; value: unknown }) {
  const [revealed, setRevealed] = useState(!field.sensitive)
  const [copied, setCopied] = useState(false)
  const copy = async () => { await navigator.clipboard.writeText(String(value ?? '')); setCopied(true); window.setTimeout(() => setCopied(false), 1_500) }
  return <div className="group min-w-0"><dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{field.label}</dt><dd className="mt-1 flex min-h-7 items-center gap-2 break-words text-sm text-gray-900 dark:text-gray-100"><span>{revealed ? displayValue(field, value) : '••••••••'}</span>{field.sensitive && <button type="button" onClick={() => setRevealed((current) => !current)} aria-label={revealed ? `Hide ${field.label}` : `Show ${field.label}`} className="rounded p-1 text-gray-400 hover:text-gray-700">{revealed ? <EyeOff size={15} /> : <Eye size={15} />}</button>}{field.copyable && <button type="button" onClick={() => { void copy() }} aria-label={`Copy ${field.label}`} className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-700 group-hover:opacity-100 focus:opacity-100">{copied ? <Check size={15} /> : <Copy size={15} />}</button>}</dd></div>
}
