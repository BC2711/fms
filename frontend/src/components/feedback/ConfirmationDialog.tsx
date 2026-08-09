import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useRef } from 'react'

interface ConfirmationDialogProps {
  open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string
  variant?: 'danger' | 'warning' | 'primary'; onConfirm: () => void; onCancel: () => void
  isLoading?: boolean; closeOnOverlayClick?: boolean
}

export function ConfirmationDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'primary', onConfirm, onCancel, isLoading = false, closeOnOverlayClick = true }: ConfirmationDialogProps) {
  const titleId = useId(), descriptionId = useId(), panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLElement>('button')?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) onCancel()
      if (event.key !== 'Tab') return
      const items = [...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled)') ?? [])]
      if (!items.length) return
      const first = items[0], last = items.at(-1)!
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keydown); return () => document.removeEventListener('keydown', keydown)
  }, [isLoading, onCancel, open])
  const color = { danger: 'bg-red-600 hover:bg-red-700', warning: 'bg-yellow-500 hover:bg-yellow-600', primary: 'bg-blue-600 hover:bg-blue-700' }[variant]
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[110] grid place-items-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (closeOnOverlayClick && event.target === event.currentTarget && !isLoading) onCancel() }}><motion.div ref={panel} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} initial={{ opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900"><h2 id={titleId} className="text-lg font-semibold">{title}</h2><p id={descriptionId} className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p><div className="mt-6 flex justify-end gap-2"><button type="button" disabled={isLoading} onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm dark:border-gray-700">{cancelLabel}</button><button type="button" disabled={isLoading} onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${color}`}>{isLoading ? 'Working…' : confirmLabel}</button></div></motion.div></motion.div>}</AnimatePresence>
}
