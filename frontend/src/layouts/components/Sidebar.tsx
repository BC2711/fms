import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Settings, HelpCircle } from 'lucide-react'
import { useState, useCallback } from 'react'

import type { User } from '@/auth/auth.types'
import { NavigationGenerator } from '@/framework/generators/NavigationGenerator'
import type { MenuItem } from '@/types/configuration.types'

interface SidebarProps {
  items: MenuItem[]
  user: User | null
  mobile?: boolean
  onNavigate?: () => void
}

const SIDEBAR_WIDTHS = {
  expanded: 288,
  collapsed: 76,
} as const

const ANIMATION_CONFIG = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as const,
}

function UserAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'

  return (
    <div
      className={`${sizeClasses} relative shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white shadow-lg shadow-blue-500/20 ring-2 ring-white dark:ring-gray-900`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
      <span className="relative z-10 flex h-full w-full items-center justify-center">
        {name.charAt(0)}
      </span>
    </div>
  )
}

function UserInfo({ user, isCollapsed }: { user: User | null; isCollapsed: boolean }) {
  const displayName = user?.name ?? 'Guest user'
  const displayEmail = user?.email ?? 'Not signed in'
  const avatarChar = user?.name?.charAt(0) ?? 'G'

  if (isCollapsed) {
    return (
      <div className="flex justify-center" title={displayName}>
        <UserAvatar name={avatarChar} size="sm" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/5">
      <UserAvatar name={avatarChar} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {displayName}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {displayEmail}
        </p>
      </div>
      <ChevronRight size={14} className="shrink-0 text-gray-400" />
    </div>
  )
}

function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div
      className={`flex h-[72px] shrink-0 items-center border-b border-slate-200/80 dark:border-white/10 ${isCollapsed ? 'justify-center px-3' : 'px-5'
        }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
        FM
      </div>
      {!isCollapsed && (
        <div className="ml-3 min-w-0">
          <h2 className="truncate text-base font-bold tracking-tight text-gray-900 dark:text-white">
            FMS Console
          </h2>
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Operations workspace
          </p>
        </div>
      )}
    </div>
  )
}

function CollapseButton({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean
  onToggle: () => void
}) {
  return (
    <div className="px-3 py-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!isCollapsed}
        className="group flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-blue-400/30 dark:hover:text-blue-400"
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        ) : (
          <>
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  )
}

function SidebarFooter({ isCollapsed }: { isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-4 p-3">
        <button
          type="button"
          aria-label="Help"
          className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <HelpCircle size={18} />
        </button>
        <button
          type="button"
          aria-label="Settings"
          className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <Settings size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-3">
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <HelpCircle size={18} />
        <span>Help & Support</span>
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <Settings size={18} />
        <span>Settings</span>
      </button>
    </div>
  )
}

export function Sidebar({ items, user, mobile = false, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const reducedMotion = useReducedMotion()

  const isCollapsed = mobile ? false : collapsed

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded
  const transitionDuration = reducedMotion ? 0 : ANIMATION_CONFIG.duration

  return (
    <motion.aside
      aria-label="Main navigation"
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{
        duration: transitionDuration,
        ease: ANIMATION_CONFIG.ease,
      }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[8px_0_30px_-24px_rgba(15,23,42,.35)] dark:border-white/10 dark:bg-slate-950"
    >
      <SidebarHeader isCollapsed={isCollapsed} />

      {!mobile && (
        <CollapseButton
          isCollapsed={isCollapsed}
          onToggle={handleToggleCollapse}
        />
      )}

      <nav
        className="mac-sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-visible px-3 py-1"
        aria-label="Navigation menu"
      >
        <NavigationGenerator
          menuItems={items}
          layout="sidebar"
          collapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="border-t border-gray-100/50 dark:border-gray-800/50">
        <SidebarFooter isCollapsed={isCollapsed} />
        <div className="border-t border-gray-100/50 p-3 dark:border-gray-800/50">
          <UserInfo user={user} isCollapsed={isCollapsed} />
        </div>
      </div>
    </motion.aside>
  )
}
