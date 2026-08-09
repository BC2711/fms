import { Bell, Menu, Search, User as UserIcon, LogOut, Settings, ChevronDown, Command, Keyboard, HelpCircle } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'

import type { User } from '@/auth/auth.types'
import { NavigationGenerator } from '@/framework/generators/NavigationGenerator'
import type { LayoutType } from '@/hooks/useLayoutPreference'
import { LayoutSwitcher } from '@/layouts/components/LayoutSwitcher'
import { ThemeSwitcher } from '@/layouts/components/ThemeSwitcher'
import type { MenuItem } from '@/types/configuration.types'

interface NavbarProps {
  items: MenuItem[]
  user: User | null
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  onMobileMenuToggle: () => void
  alignment?: 'left' | 'center'
}

const DROPDOWN_ANIMATION = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.96 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
} as const

const COMMAND_PALETTE_ANIMATION = {
  initial: { opacity: 0, scale: 0.95, y: -20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
} as const

function NotificationBadge() {
  return (
    <span className="absolute right-2 top-2 flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-950" />
    </span>
  )
}

function UserDropdown({
  user,
  onClose,
  triggerRef
}: {
  user: User | null
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
          top: rect.bottom + 12,
          left: rect.right - 320, // w-80 = 320px, aligns right edge
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
      initial={reducedMotion ? false : DROPDOWN_ANIMATION.initial}
      animate={DROPDOWN_ANIMATION.animate}
      exit={reducedMotion ? undefined : DROPDOWN_ANIMATION.exit}
      transition={reducedMotion ? { duration: 0 } : DROPDOWN_ANIMATION.transition}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className="w-80 overflow-hidden rounded-2xl border border-gray-200/60 bg-white/95 shadow-[0_20px_70px_-20px_rgba(0,0,0,.15)] ring-1 ring-black/5 backdrop-blur-2xl dark:border-gray-700/60 dark:bg-gray-900/95 dark:shadow-[0_20px_70px_-20px_rgba(0,0,0,.5)]"
    >
      {/* User Info Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-5 dark:from-gray-800/50 dark:to-gray-900">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-500/20 ring-2 ring-white dark:ring-gray-900">
              {user?.name?.charAt(0) ?? 'G'}
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
              {user?.name ?? 'Guest user'}
            </p>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
              {user?.email ?? 'Not signed in'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <button
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <UserIcon size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1 text-left">
            <span>View Profile</span>
          </div>
          <span className="text-xs text-gray-400">⌘P</span>
        </button>
        <button
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <Settings size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1 text-left">
            <span>Settings</span>
          </div>
          <span className="text-xs text-gray-400">⌘,</span>
        </button>
        <button
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <HelpCircle size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1 text-left">
            <span>Help & Support</span>
          </div>
        </button>
        <div className="my-1.5 border-t border-gray-100 dark:border-gray-800" />
        <button
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
            <LogOut size={16} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <span>Sign out</span>
          </div>
        </button>
      </div>
    </motion.div>
  )

  return createPortal(dropdown, document.body)
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const reducedMotion = useReducedMotion()

  const palette = (
    <motion.div
      initial={reducedMotion ? false : COMMAND_PALETTE_ANIMATION.initial}
      animate={COMMAND_PALETTE_ANIMATION.animate}
      exit={reducedMotion ? undefined : COMMAND_PALETTE_ANIMATION.exit}
      transition={reducedMotion ? { duration: 0 } : COMMAND_PALETTE_ANIMATION.transition}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      }}
      className="w-[480px] max-w-[90vw] overflow-hidden rounded-2xl border border-gray-200/60 bg-white/95 shadow-[0_20px_70px_-20px_rgba(0,0,0,.2)] ring-1 ring-black/5 backdrop-blur-2xl dark:border-gray-700/60 dark:bg-gray-900/95 dark:shadow-[0_20px_70px_-20px_rgba(0,0,0,.5)]"
    >
      {/* Search Input */}
      <div className="flex items-center gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Type a command or search..."
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500"
          autoFocus
        />
        <kbd className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-800">
          esc
        </kbd>
      </div>

      {/* Suggestions */}
      <div className="p-2">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Suggestions
        </div>
        {['Dashboard', 'Projects', 'Team', 'Settings', 'Help'].map((item) => (
          <button
            key={item}
            onClick={onClose}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-all hover:bg-gray-100 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Command size={16} className="text-gray-400" />
            <span>{item}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )

  return createPortal(palette, document.body)
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  badge,
  active,
  className,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  onClick?: () => void
  badge?: React.ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-slate-100 hover:text-slate-950 active:scale-95 dark:hover:bg-white/10 dark:hover:text-white ${active ? 'bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white' : 'text-slate-500 dark:text-slate-400'
        } ${className}`}
    >
      <Icon size={18} />
      {badge}
    </button>
  )
}

export function Navbar({
  items,
  user,
  layout,
  onLayoutChange,
  onMobileMenuToggle,
  alignment = 'center',
}: NavbarProps) {
  const [userOpen, setUserOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)

  const handleCloseDropdown = useCallback(() => setUserOpen(false), [])
  const handleToggleDropdown = useCallback(() => setUserOpen((prev) => !prev), [])
  const handleToggleCommandPalette = useCallback(() => setCommandPaletteOpen((prev) => !prev), [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside and escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setUserOpen(false)
        setCommandPaletteOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserOpen(false)
        setCommandPaletteOpen(false)
      }
    }

    const handleCommandK = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleCommandK)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleCommandK)
    }
  }, [])

  // Close dropdowns on scroll
  useEffect(() => {
    const handleScroll = () => {
      setUserOpen(false)
      setCommandPaletteOpen(false)
    }

    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [])

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 shadow-[0_8px_30px_-24px_rgba(15,23,42,.55)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-950/85">
      {/* Top Bar - Actions & Brand */}
      <header
        ref={rootRef}
        className={`relative h-[68px] transition-all duration-300 ${isScrolled ? 'bg-white/45 dark:bg-slate-950/45' : ''}`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={onMobileMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-all hover:bg-gray-100 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Brand */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/20">
              <span className="relative z-10">F</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-[15px] font-bold leading-tight tracking-tight text-slate-950 dark:text-white">FMS</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Workspace</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search Bar (Desktop) */}
          <button
            onClick={handleToggleCommandPalette}
            className="group hidden h-10 items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm text-slate-400 shadow-inner shadow-slate-900/[.02] transition-all hover:border-blue-300 hover:bg-white hover:text-slate-600 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/40 dark:hover:bg-white/10 dark:hover:text-slate-300 lg:flex lg:w-64 xl:w-80"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="hidden rounded-lg border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:border-gray-700 dark:bg-gray-800 xl:inline-block">
              ⌘K
            </kbd>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200/70 bg-white/60 p-1 shadow-sm ring-1 ring-black/[.02] dark:border-white/10 dark:bg-white/5 dark:ring-white/[.03]">
            {/* Mobile Search */}
            <ActionButton
              icon={Search}
              label="Search"
              onClick={handleToggleCommandPalette}
              className="lg:hidden"
            />

            {/* Notifications */}
            <ActionButton
              icon={Bell}
              label="Notifications"
              badge={<NotificationBadge />}
            />

            {/* Keyboard Shortcuts */}
            <ActionButton
              icon={Keyboard}
              label="Keyboard shortcuts"
              className="hidden md:flex"
            />

            <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Layout Switcher */}
            <LayoutSwitcher layout={layout} onChange={onLayoutChange} />

            {/* User Menu */}
            <div className="ml-1">
              <button
                ref={userButtonRef}
                type="button"
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={userOpen}
                onClick={handleToggleDropdown}
                className={`flex h-9 items-center gap-2 rounded-xl px-1.5 transition-all hover:bg-slate-100 active:scale-95 dark:hover:bg-white/10 ${userOpen ? 'bg-slate-100 dark:bg-white/10' : ''
                  }`}
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-sm ring-2 ring-white dark:ring-gray-950">
                  {user?.name?.charAt(0) ?? 'G'}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-950" />
                </div>
                <ChevronDown
                  size={14}
                  className={`hidden text-gray-400 transition-transform duration-200 sm:block ${userOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Primary navigation */}
      <nav
        className="hidden lg:block"
      >
        <div className="mx-auto max-w-[1440px] px-8 pb-2.5">
          <div className={`flex min-h-11 items-center overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-50/70 p-1 shadow-inner shadow-slate-900/[.025] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-white/10 dark:bg-white/[.035] ${alignment === 'center' ? 'justify-start 2xl:justify-center' : 'justify-start'}`}>
            <NavigationGenerator
              menuItems={items}
              layout="navbar"
              collapsed={false}
            />
          </div>
        </div>
      </nav>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            className="bg-black/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Portals */}
      <AnimatePresence>
        {userOpen && (
          <UserDropdown
            user={user}
            onClose={handleCloseDropdown}
            triggerRef={userButtonRef}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commandPaletteOpen && (
          <CommandPalette onClose={() => setCommandPaletteOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
