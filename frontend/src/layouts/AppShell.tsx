import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/auth/auth.store'
import { menuConfig } from '@/config/menu.config'
import { useLayoutPreference, type LayoutType } from '@/hooks/useLayoutPreference'
import { MacSidebarLayout } from '@/layouts/MacSidebarLayout'
import { WindowsNavbarLayout } from '@/layouts/WindowsNavbarLayout'

export interface AppShellProps {
  layoutType?: LayoutType
}

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const

const LAYOUT_TRANSITION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
} as const

function SkipToContent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !isVisible) {
        setIsVisible(true)
      }
    }

    const handleMouseDown = () => {
      if (!isVisible) {
        setIsVisible(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [isVisible])

  return (
    <motion.a
      href="#main-content"
      initial={{ y: -100, opacity: 0 }}
      animate={isVisible ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed left-1/2 top-4 z-[200] -translate-x-1/2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 ring-1 ring-black/5 transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-white/10 dark:focus:ring-offset-gray-950"
    >
      Skip to main content
    </motion.a>
  )
}

function LayoutContainer({
  layout,
  children,
}: {
  layout: LayoutType
  children: React.ReactNode
}) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      key={layout}
      initial={reducedMotion ? false : LAYOUT_TRANSITION.initial}
      animate={LAYOUT_TRANSITION.animate}
      exit={reducedMotion ? undefined : LAYOUT_TRANSITION.exit}
      transition={reducedMotion ? { duration: 0 } : LAYOUT_TRANSITION.transition}
      className="h-dvh"
    >
      {children}
    </motion.div>
  )
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reducedMotion ? false : PAGE_TRANSITION.initial}
        animate={PAGE_TRANSITION.animate}
        exit={reducedMotion ? undefined : PAGE_TRANSITION.exit}
        transition={reducedMotion ? { duration: 0 } : PAGE_TRANSITION.transition}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function AppShell({ layoutType }: AppShellProps) {
  const [preferredLayout, setPreferredLayout] = useLayoutPreference()
  const user = useAuthStore((state) => state.user)
  const layout = layoutType ?? preferredLayout

  const handleLayoutChange = useCallback(
    (newLayout: LayoutType) => {
      setPreferredLayout(newLayout)
    },
    [setPreferredLayout]
  )

  const sharedProps = {
    items: menuConfig,
    user,
    layout,
    onLayoutChange: handleLayoutChange,
  }

  return (
    <>
      <SkipToContent />

      <LayoutContainer layout={layout}>
        {layout === 'windows-navbar' ? (
          <WindowsNavbarLayout {...sharedProps}>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </WindowsNavbarLayout>
        ) : (
          <MacSidebarLayout {...sharedProps}>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </MacSidebarLayout>
        )}
      </LayoutContainer>
    </>
  )
}
