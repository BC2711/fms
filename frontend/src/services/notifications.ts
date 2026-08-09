import { showToast } from '@/components/feedback/toast.store'

export type NotificationType = 'success' | 'error'

export interface AppNotification {
  type: NotificationType
  message: string
}

export function showNotification(notification: AppNotification): void {
  showToast(notification.message, notification.type)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<AppNotification>('fms:notification', { detail: notification }))
}

export function showSuccessNotification(message: string): void {
  showNotification({ type: 'success', message })
}

export function showErrorNotification(message: string): void {
  showNotification({ type: 'error', message })
}
