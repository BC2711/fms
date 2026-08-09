import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Columns3, PanelTop } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { LayoutType } from '@/hooks/useLayoutPreference'

interface LayoutSwitcherProps {
  layout: LayoutType
  onChange: (layout: LayoutType) => void
}

const layouts = [
  {
    id: 'mac-sidebar' as const,
    icon: Columns3,
    label: 'Sidebar',
    description: 'Navigation on the left side',
  },
  {
    id: 'windows-navbar' as const,
    icon: PanelTop,
    label: 'Navbar',
    description: 'Navigation at the top',
  },
] as const

const MENU_ANIMATION = {
  initial: { opacity: 0, y: -4, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.95 },
  transition: { duration: 0.15, ease: 'easeOut' },
} as const

const ICON_ANIMATION = {
  initial: { opacity: 0, scale: 0.5, rotate: -90 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.5, rotate: 90 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const

function LayoutIcon({ layout, isActive }: { layout: LayoutType; isActive: boolean }) {
  const currentLayout = layouts.find((l) => l.id === layout) ?? layouts[0]
  const Icon = currentLayout.icon

  return (
    <motion.div
      key={layout}
      initial={ICON_ANIMATION.initial}
      animate={ICON_ANIMATION.animate}
      exit={ICON_ANIMATION.exit}
      transition={ICON_ANIMATION.transition}
      className="relative"
    >
      <Icon
        size={18}
        aria-hidden="true"
        className={isActive ? 'text-blue-600 dark:text-blue-400' : ''}
      />
    </motion.div>
  )
}

function LayoutDropdown({
  currentLayout,
  onSelect,
  onClose,
  triggerRef,
}: {
  currentLayout: LayoutType
  onSelect: (layout: LayoutType) => void
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}) {
  const reducedMotion = useReducedMotion()
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 8,
          left: rect.right - 224, // w-56 = 224px, aligns right edge
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
  }, [triggerRef])

  const dropdown = (
    <motion.div
      role="menu"
      initial={reducedMotion ? false : MENU_ANIMATION.initial}
      animate={MENU_ANIMATION.animate}
      exit={reducedMotion ? undefined : MENU_ANIMATION.exit}
      transition={reducedMotion ? { duration: 0 } : MENU_ANIMATION.transition}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className="w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,.15)] ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,.4)]"
    >
      <div className="px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Layout
        </p>
      </div>
      {layouts.map(({ id, icon: Icon, label, description }) => (
        <button
          key={id}
          type="button"
          role="menuitem"
          onClick={() => {
            onSelect(id)
            onClose()
          }}
          className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.98] ${currentLayout === id
              ? 'bg-blue-50 dark:bg-blue-500/10'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${currentLayout === id
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
          >
            <Icon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium ${currentLayout === id
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-gray-900 dark:text-white'
                }`}
            >
              {label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
          {currentLayout === id && (
            <motion.div
              layoutId="activeLayout"
              className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
      ))}
    </motion.div>
  )

  return createPortal(dropdown, document.body)
}

export function LayoutSwitcher({ layout, onChange }: LayoutSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const currentLayout = layouts.find((l) => l.id === layout) ?? layouts[0]

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleSelect = useCallback(
    (newLayout: LayoutType) => {
      onChange(newLayout)
    },
    [onChange]
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label={`Current layout: ${currentLayout.label}. Click to change layout.`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800 ${isOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
      >
        <AnimatePresence mode="wait">
          <LayoutIcon layout={layout} isActive={isOpen} />
        </AnimatePresence>

        {/* Tooltip */}
        {/* <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
          {currentLayout.label} layout
        </span> */}
      </button>

      <AnimatePresence>
        {isOpen && (
          <LayoutDropdown
            currentLayout={layout}
            onSelect={handleSelect}
            onClose={handleClose}
            triggerRef={triggerRef}
          />
        )}
      </AnimatePresence>
    </>
  )
}
