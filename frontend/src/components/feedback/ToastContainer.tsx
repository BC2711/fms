import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'
import { useEffect } from 'react'

import { type Toast, useToastStore } from './toast.store'

const styles = { success: 'border-green-300 bg-green-50 text-green-800', error: 'border-red-300 bg-red-50 text-red-800', warning: 'border-yellow-300 bg-yellow-50 text-yellow-800', info: 'border-blue-300 bg-blue-50 text-blue-800' }
const icons = { success: CircleCheck, error: CircleX, warning: TriangleAlert, info: Info }

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((state) => state.removeToast)
  useEffect(() => { const timer = window.setTimeout(() => remove(toast.id), toast.duration ?? 5000); return () => window.clearTimeout(timer) }, [remove, toast])
  const Icon = icons[toast.variant]
  return <motion.div role={toast.variant === 'error' ? 'alert' : 'status'} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className={`flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg ${styles[toast.variant]}`}><Icon className="mt-0.5 shrink-0" size={18} /><p className="flex-1 text-sm font-medium">{toast.message}</p><button type="button" aria-label="Close notification" onClick={() => remove(toast.id)}><X size={16} /></button></motion.div>
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  return <div aria-label="Notifications" className="fixed right-4 top-4 z-[100] flex flex-col gap-2"><AnimatePresence>{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} />)}</AnimatePresence></div>
}
