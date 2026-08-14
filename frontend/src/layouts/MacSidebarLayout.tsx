import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X, PanelLeft, Search } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

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
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const current = (segments.at(-1) ?? 'dashboard').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  const section = segments.length > 1 ? segments[0].replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Workspace'

  return (
    <header className="relative flex h-[72px] shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 sm:px-6">
      {/* Mobile Menu Button */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 md:hidden"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      {/* Breadcrumb / Page Title Area */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:flex"><PanelLeft size={17} /></div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[.14em] text-slate-400">{section}</p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{current}</p>
        </div>
      </div>

      {/* Actions - No overflow hidden */}
      <div className="ml-auto flex items-center gap-1.5">
        <button type="button" aria-label="Search" className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition hover:border-blue-300 hover:bg-white sm:flex dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/40"><Search size={15} /><span className="hidden lg:inline">Quick search</span><kbd className="ml-2 text-[10px]">Ctrl K</kbd></button>
        <ThemeSwitcher />
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
      className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 dark:bg-slate-950"
    >
      <div className="mx-auto w-full max-w-[1600px] p-4 pb-24 sm:p-6 lg:p-8">
        {children}
      </div>
    </main>
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
    <div className="relative flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950">

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
      <div className="relative z-10 ml-0 flex min-w-0 flex-1 flex-col">
        <TopBar
          layout={layout}
          onLayoutChange={onLayoutChange}
          onMenuClick={handleOpenDrawer}
        />
        <MainContent>{children}</MainContent>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation items={items} />

    </div>
  )
}
