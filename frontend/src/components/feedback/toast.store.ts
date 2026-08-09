import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'
export interface Toast { id: string; message: string; variant: ToastVariant; duration?: number }
interface ToastStore { toasts: Toast[]; addToast: (toast: Omit<Toast, 'id'>) => string; removeToast: (id: string) => void }

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => { const id = crypto.randomUUID(); set((state) => ({ toasts: [...state.toasts, { ...toast, id }] })); return id },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

export function showToast(message: string, variant: ToastVariant = 'info', duration = 5000): string {
  return useToastStore.getState().addToast({ message, variant, duration })
}
