import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useTheme, type Theme } from '@/providers/ThemeProvider'

const themes = [
  { id: 'light' as const, icon: Sun, label: 'Light' },
  { id: 'dark' as const, icon: Moon, label: 'Dark' },
  { id: 'system' as const, icon: Monitor, label: 'System' },
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

function ThemeIcon({ theme, isActive }: { theme: Theme; isActive: boolean }) {
  const Icon = themes.find((t) => t.id === theme)?.icon ?? Sun

  return (
    <motion.div
      key={theme}
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

function ThemeDropdown({
  currentTheme,
  onSelect,
  onClose,
  triggerRef,
}: {
  currentTheme: Theme
  onSelect: (theme: Theme) => void
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
          left: rect.right - 160, // w-40 = 160px, aligns right edge
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
      className="w-40 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,.15)] ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,.4)]"
    >
      {themes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          role="menuitem"
          onClick={() => {
            onSelect(id)
            onClose()
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${currentTheme === id
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            }`}
        >
          <Icon
            size={16}
            className={
              currentTheme === id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400'
            }
          />
          <span>{label}</span>
          {currentTheme === id && (
            <motion.div
              layoutId="activeTheme"
              className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
      ))}
    </motion.div>
  )

  return createPortal(dropdown, document.body)
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const currentThemeConfig = themes.find((t) => t.id === theme) ?? themes[0]

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleSelect = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme)
    },
    [setTheme]
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Close on Escape key
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

  // Close on scroll or resize
  useEffect(() => {
    if (!isOpen) return

    const handleScroll = () => setIsOpen(false)
    const handleResize = () => setIsOpen(false)

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label={`Current theme: ${currentThemeConfig.label}. Click to change theme.`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800 ${isOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
      >
        <AnimatePresence mode="wait">
          <ThemeIcon theme={theme} isActive={isOpen} />
        </AnimatePresence>

        {/* Tooltip */}
        {/* <span className="pointer-events-none absolute -bottom-8 z-9999 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
          Theme: {currentThemeConfig.label}
        </span> */}
      </button>

      <AnimatePresence>
        {isOpen && (
          <ThemeDropdown
            currentTheme={theme}
            onSelect={handleSelect}
            onClose={handleClose}
            triggerRef={triggerRef}
          />
        )}
      </AnimatePresence>
    </>
  )
}