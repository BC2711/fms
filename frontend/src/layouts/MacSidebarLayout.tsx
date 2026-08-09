import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X, Command } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

import type { User } from '@/auth/auth.types'
import type { LayoutType } from '@/hooks/useLayoutPreference'
import { LayoutSwitcher } from '@/layouts/components/LayoutSwitcher'
import { Sidebar } from '@/layouts/components/Sidebar'
import { ThemeSwitcher } from '@/layouts/components/ThemeSwitcher'
import type { MenuItem } from '@/types/configuration.types'
import { MobileNavigation } from '@/components/ui/MobileNavigation'

interface MacSidebarLayoutProps {
  children: ReactNode
  items: MenuItem[]
  user: User | null
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
}

const DRAWER_ANIMATION = {
  initial: { x: -320, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -320, opacity: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
} as const

const OVERLAY_ANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
} as const

function MobileDrawerOverlay({
  onClose,
  reducedMotion,
}: {
  onClose: () => void
  reducedMotion: boolean | null
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : OVERLAY_ANIMATION.initial}
      animate={OVERLAY_ANIMATION.animate}
      exit={reducedMotion ? undefined : OVERLAY_ANIMATION.exit}
      transition={reducedMotion ? { duration: 0 } : OVERLAY_ANIMATION.transition}
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md md:hidden"
      aria-hidden="true"
    />
  )
}

function MobileDrawer({
  items,
  user,
  onClose,
  reducedMotion,
}: {
  items: MenuItem[]
  user: User | null
  onClose: () => void
  reducedMotion: boolean | null
}) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <motion.div
      data-testid="mobile-sidebar-drawer"
      initial={reducedMotion ? false : DRAWER_ANIMATION.initial}
      animate={DRAWER_ANIMATION.animate}
      exit={reducedMotion ? undefined : DRAWER_ANIMATION.exit}
      transition={reducedMotion ? { duration: 0 } : DRAWER_ANIMATION.transition}
      className="fixed inset-y-0 left-0 z-50 w-[320px] max-w-[85vw] md:hidden"
    >
      <div className="relative h-full">
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-gray-500 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-all hover:bg-white hover:text-gray-900 active:scale-95 dark:bg-gray-900/80 dark:text-gray-400 dark:ring-white/10 dark:hover:bg-gray-900 dark:hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </button>
        <Sidebar items={items} user={user} mobile onNavigate={onClose} />
      </div>
    </motion.div>
  )
}

function TopBar({
  layout,
  onLayoutChange,
  onMenuClick,
}: {
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  onMenuClick: () => void
}) {
  return (
    <header className="relative mb-4 flex h-12 shrink-0 items-center gap-3 rounded-2xl border border-gray-200/30 bg-white/70 px-4 shadow-sm backdrop-blur-2xl backdrop-saturate-150 dark:border-gray-800/30 dark:bg-gray-950/70">
      {/* Mobile Menu Button */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white md:hidden"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      {/* Breadcrumb / Page Title Area */}
      <div className="hidden items-center gap-2 text-sm sm:flex">
        <Command size={14} className="text-gray-400" />
        <span className="font-medium text-gray-900 dark:text-white">Dashboard</span>
      </div>

      {/* Actions - No overflow hidden */}
      <div className="ml-auto flex items-center gap-1">
        <ThemeSwitcher />
        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-800" />
        <LayoutSwitcher layout={layout} onChange={onLayoutChange} />
      </div>
    </header>
  )
}

function MainContent({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-gray-200/30 bg-white/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,.08)] backdrop-blur-2xl backdrop-saturate-150 dark:border-gray-800/30 dark:bg-gray-950/80 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,.3)]"
    >
      <div className="p-6 pb-24 md:p-8">
        {children}
      </div>
    </main>
  )
}

function KeyboardShortcut({ keys }: { keys: string[] }) {
  return (
    <div className="hidden items-center gap-1 md:flex">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {key}
        </kbd>
      ))}
    </div>
  )
}

export function MacSidebarLayout({
  children,
  items,
  user,
  layout,
  onLayoutChange,
}: MacSidebarLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  const handleOpenDrawer = useCallback(() => setDrawerOpen(true), [])
  const handleCloseDrawer = useCallback(() => setDrawerOpen(false), [])

  // Keyboard shortcut to open drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setDrawerOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && drawerOpen) {
        handleCloseDrawer()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen, handleCloseDrawer])

  return (
    <div className="relative flex h-dvh overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 p-2 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 md:p-4">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.015] dark:opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar items={items} user={user} />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <MobileDrawerOverlay
              onClose={handleCloseDrawer}
              reducedMotion={reducedMotion}
            />
            <MobileDrawer
              items={items}
              user={user}
              onClose={handleCloseDrawer}
              reducedMotion={reducedMotion}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="relative z-10 ml-0 flex min-w-0 flex-1 flex-col md:ml-5">
        <TopBar
          layout={layout}
          onLayoutChange={onLayoutChange}
          onMenuClick={handleOpenDrawer}
        />
        <MainContent>{children}</MainContent>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation items={items} />

      {/* Keyboard shortcut hint */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 hidden -translate-x-1/2 md:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.3 }}
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm shadow-lg backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80"
        >
          <span className="text-gray-500 dark:text-gray-400">Open menu</span>
          <KeyboardShortcut keys={['⌘', 'K']} />
        </motion.div>
      </div>
    </div>
  )
}