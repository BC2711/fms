import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog'
import { showToast } from '@/components/feedback/toast.store'
import { executeAction, type ActionContext } from '@/framework/registry/action-registry'
import { DynamicIcon } from '@/framework/runtime/DynamicIcon'
import { PermissionGuard } from '@/framework/runtime/PermissionGuard'
import type { ActionConfig } from '@/types/configuration.types'

interface ActionGeneratorProps {
  actions?: ActionConfig[]
  action?: ActionConfig
  context?: ActionContext
  position?: 'header' | 'row' | 'toolbar'
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
}

function ActionButton({ action, context, position }: { action: ActionConfig; context: ActionContext; position: NonNullable<ActionGeneratorProps['position']> }) {
  const navigate = useNavigate(), queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false), [loading, setLoading] = useState(false)
  const requiresConfirmation = action.requires_confirmation ?? Boolean(action.confirmation)
  const run = async () => {
    setLoading(true)
    const result = await executeAction(action, { ...context, navigate: (to) => typeof to === 'number' ? navigate(to) : navigate(to), queryClient })
    setLoading(false); setConfirming(false)
    if (result.success) {
      showToast(action.success_message ?? `${action.label} completed successfully.`, 'success')
      if (action.redirect_after_success) navigate(action.redirect_after_success)
    } else showToast(action.error_message ?? (result.error instanceof Error ? result.error.message : `${action.label} failed.`), 'error')
  }
  const variant = action.variant ?? (action.type === 'delete' ? 'danger' : position === 'row' ? 'ghost' : 'primary')
  return <PermissionGuard permissions={action.permission}>
    <button type="button" aria-label={action.label} disabled={action.disabled || loading} onClick={() => requiresConfirmation ? setConfirming(true) : void run()} className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${position === 'row' ? 'p-1.5' : 'px-3 py-2'} ${variants[variant]}`}>
      {action.icon && <DynamicIcon iconKey={action.icon} size={16} />}{position !== 'row' && action.label}{loading && <span className="sr-only">Loading</span>}
    </button>
    <ConfirmationDialog open={confirming} title={action.confirmation_title ?? `Confirm ${action.label}`} message={action.confirmation ?? `Are you sure you want to ${action.label.toLowerCase()}?`} confirmLabel={action.label} variant={variant === 'danger' ? 'danger' : 'primary'} isLoading={loading} onCancel={() => setConfirming(false)} onConfirm={() => void run()} />
  </PermissionGuard>
}

export function ActionGenerator({ actions, action, context = {}, position = 'header' }: ActionGeneratorProps) {
  const configured = actions ?? (action ? [action] : [])
  return <>{configured.map((item) => <ActionButton key={item.id} action={item} context={context} position={position} />)}</>
}
