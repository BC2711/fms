import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import { DynamicIcon } from '@/framework/runtime/DynamicIcon'

export function MenuIcon({ icon, size = 18 }: { icon?: string; size?: number }) {
  return <DynamicIcon iconKey={icon ?? 'CircleCheck'} size={size} className="shrink-0" />
}

export function ActiveMenuIndicator({ navbar = false }: { navbar?: boolean }) {
  return navbar
    ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
    : <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-blue-500" />
}

interface FloatingMenuProps {
  open: boolean
  labelledBy: string
  children: ReactNode
}

interface CollapsedMenuTooltipProps extends FloatingMenuProps {
  anchorRef: RefObject<HTMLElement | null>
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function CollapsedMenuTooltip({
  open,
  labelledBy,
  children,
  anchorRef,
  onMouseEnter,
  onMouseLeave,
}: CollapsedMenuTooltipProps) {
  const reducedMotion = useReducedMotion()
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (rect) {
        const availableHeight = Math.max(240, window.innerHeight - 32)
        const flyoutHeight = Math.min(520, availableHeight)
        setPosition({
          left: rect.right,
          top: Math.max(16, Math.min(rect.top - 8, window.innerHeight - flyoutHeight - 16)),
        })
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorRef, open])

  const tooltip = (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          aria-labelledby={labelledBy}
          initial={reducedMotion ? false : { opacity: 0, x: -5, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -3, scale: 0.98 }}
          transition={{ duration: reducedMotion ? 0 : 0.14 }}
          style={{ left: position.left, top: position.top }}
          className="fixed z-[80] pl-3"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="max-h-[min(520px,calc(100vh-32px))] w-[min(360px,calc(100vw-112px))] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 p-2.5 shadow-[0_24px_70px_-24px_rgba(15,23,42,.5)] ring-1 ring-black/[.04] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95 dark:ring-white/[.04]">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(tooltip, document.body)
}

interface NavbarDropdownProps extends FloatingMenuProps { position: { left: number; top: number } }

export function NavbarDropdown({ open, labelledBy, position, children }: NavbarDropdownProps) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          aria-labelledby={labelledBy}
          initial={reducedMotion ? false : { opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -2 }}
          transition={{ duration: reducedMotion ? 0 : 0.12 }}
          style={{ left: position.left, top: position.top, width: 'min(760px, calc(100vw - 32px))' }}
          className="fixed z-[80] max-h-[calc(100vh-96px)] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/95 p-2.5 shadow-[0_28px_90px_-28px_rgba(15,23,42,.5)] ring-1 ring-black/[.04] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95 dark:ring-white/[.04]"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
