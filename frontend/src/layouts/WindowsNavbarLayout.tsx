import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Search, X, Command } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

import type { User } from '@/auth/auth.types'
import { NavigationGenerator } from '@/framework/generators/NavigationGenerator'
import type { LayoutType } from '@/hooks/useLayoutPreference'
import { Navbar } from '@/layouts/components/Navbar'
import type { MenuItem } from '@/types/configuration.types'
import { MobileNavigation } from '@/components/ui/MobileNavigation'

interface WindowsNavbarLayoutProps {
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
      className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
      aria-hidden="true"
    />
  )
}

function MobileDrawer({
  items,
  onClose,
  reducedMotion,
}: {
  items: MenuItem[]
  onClose: () => void
  reducedMotion: boolean | null
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <motion.aside
      data-testid="mobile-navbar-drawer"
      initial={reducedMotion ? false : DRAWER_ANIMATION.initial}
      animate={DRAWER_ANIMATION.animate}
      exit={reducedMotion ? undefined : DRAWER_ANIMATION.exit}
      transition={reducedMotion ? { duration: 0 } : DRAWER_ANIMATION.transition}
      className="fixed inset-y-0 left-0 z-50 flex w-[320px] max-w-[88vw] flex-col border-r border-slate-200 bg-white/95 shadow-2xl backdrop-blur-2xl lg:hidden dark:border-white/10 dark:bg-slate-950/95"
    >
      {/* Drawer Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Command size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Navigation
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-95 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="border-b border-gray-100 p-4 dark:border-gray-800">
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
          <Search size={16} className="text-gray-400" />
          <input
            type="search"
            placeholder="Search menu items..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500"
          />
          <kbd className="rounded-lg border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-800">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        <NavigationGenerator
          menuItems={items}
          layout="sidebar"
          collapsed={false}
          onNavigate={onClose}
        />
      </div>
    </motion.aside>
  )
}

function MainContent({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-gray-200/30 bg-white/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,.08)] backdrop-blur-2xl backdrop-saturate-150 dark:border-gray-800/30 dark:bg-gray-950/80 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,.3)]"
    >
      <div className="mx-auto max-w-7xl p-6 pb-24 md:p-8 lg:p-10">
        {children}
      </div>
    </main>
  )
}

function StatusBar() {
  return (
    <div className="hidden h-8 items-center justify-between border-t border-gray-200 bg-white/80 px-4 text-xs text-gray-500 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80 dark:text-gray-400 md:flex">
      <div className="flex items-center gap-4">
        <span>Ready</span>
        <span className="h-3 w-px bg-gray-200 dark:bg-gray-800" />
        <span>UTF-8</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Ln 1, Col 1</span>
        <span className="h-3 w-px bg-gray-200 dark:bg-gray-800" />
        <span>Spaces: 2</span>
      </div>
    </div>
  )
}

export function WindowsNavbarLayout({
  children,
  items,
  user,
  layout,
  onLayoutChange,
}: WindowsNavbarLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  const handleOpenDrawer = useCallback(() => setDrawerOpen(true), [])
  const handleCloseDrawer = useCallback(() => setDrawerOpen(false), [])

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
    <div className="flex h-dvh flex-col overflow-hidden bg-white dark:bg-gray-950">
      {/* Navbar */}
      <Navbar
        items={items}
        user={user}
        layout={layout}
        onLayoutChange={onLayoutChange}
        onMobileMenuToggle={handleOpenDrawer}
      />

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
              onClose={handleCloseDrawer}
              reducedMotion={reducedMotion}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <MainContent>{children}</MainContent>

      {/* Status Bar (Desktop) */}
      <StatusBar />

      {/* Mobile Navigation */}
      <MobileNavigation items={items} />
    </div>
  )
}
