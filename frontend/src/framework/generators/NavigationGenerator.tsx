import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { PermissionGuard } from '@/framework/runtime/PermissionGuard'
import { ActiveMenuIndicator, CollapsedMenuTooltip, MenuIcon, NavbarDropdown } from '@/layouts/components/navigation/MenuPrimitives'
import type { MenuConfig } from '@/types/configuration.types'

export interface NavigationGeneratorProps {
  menuItems: MenuConfig[]
  collapsed: boolean
  layout: 'sidebar' | 'navbar'
  ariaLabel?: string
  onNavigate?: () => void
}

interface MenuItemProps {
  item: MenuConfig
  depth: number
  collapsed: boolean
  layout: 'sidebar' | 'navbar'
  onNavigate?: () => void
  role?: 'menuitem'
}

function isItemActive(item: MenuConfig, pathname: string): boolean {
  const destination = item.route ?? item.path
  if (destination && (pathname === destination || (destination !== '/' && pathname.startsWith(`${destination}/`)))) return true
  return item.children?.some((child) => isItemActive(child, pathname)) ?? false
}

function RestrictedItem({ item, children }: { item: MenuConfig; children: ReactNode }) {
  return item.permissions ? <PermissionGuard permissions={item.permissions}>{children}</PermissionGuard> : children
}

export function MenuItem({ item, depth, collapsed, layout, onNavigate, role }: MenuItemProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const active = isItemActive(item, pathname)
  const [expanded, setExpanded] = useState(active)
  const [dropdownPosition, setDropdownPosition] = useState({ left: 8, top: 56 })
  const rootRef = useRef<HTMLLIElement>(null)
  const triggerRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const labelId = useId()
  const visibleChildren = item.children?.filter((child) => child.is_visible !== false) ?? []
  const hasChildren = visibleChildren.length > 0
  const isCollapsedFlyout = layout === 'sidebar' && collapsed
  const isNavbarDropdown = layout === 'navbar'

  const keepFlyoutOpen = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
    setExpanded(true)
  }, [])

  const scheduleFlyoutClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setExpanded(false), 100)
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    if (!expanded) return
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setExpanded(false) }
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { setExpanded(false); triggerRef.current?.focus() }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [expanded])

  if (item.is_visible === false) return null
  if (item.type === 'divider') return <li role="presentation" className="px-2 py-2"><hr className="border-gray-200/70 dark:border-gray-700/70" /></li>
  if (item.type === 'group') return collapsed ? null : <li className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[.12em] text-gray-400">{item.label}</li>

  const activate = () => {
    if (item.disabled) return
    if (hasChildren) {
      if (isNavbarDropdown) {
        const rect = triggerRef.current?.getBoundingClientRect()
        if (rect) {
          const dropdownWidth = Math.min(760, window.innerWidth - 32)
          setDropdownPosition({
            left: Math.max(16, Math.min(rect.left, window.innerWidth - dropdownWidth - 16)),
            top: rect.bottom + 10,
          })
        }
      }
      setExpanded((value) => !value)
    }
    else if (item.external && (item.route ?? item.path)) return
    else if (item.route ?? item.path) { navigate((item.route ?? item.path)!); onNavigate?.() }
  }
  const keyboard = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { setExpanded(false); triggerRef.current?.focus() }
    if (hasChildren && (event.key === 'ArrowDown' || event.key === 'ArrowRight')) { event.preventDefault(); setExpanded(true) }
  }
  const spacing = layout === 'sidebar' && !collapsed ? { paddingLeft: `${12 + depth * 16}px` } : undefined
  const sidebarClass = `relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150 ${depth === 0 ? 'font-semibold' : 'font-medium'} ${active ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/15' : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'}`
  const navbarClass = `relative flex h-9 items-center gap-2 rounded-xl px-3.5 text-left text-[13px] font-medium transition-all duration-150 ${active ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/15' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'}`
  const classes = `${layout === 'navbar' ? navbarClass : sidebarClass} ${collapsed ? 'justify-center px-0' : ''} ${item.disabled ? 'cursor-not-allowed opacity-45' : ''}`
  const content = <><MenuIcon icon={item.icon} />{!collapsed && <span id={labelId} className="truncate">{item.label}</span>}{item.badge !== undefined && !collapsed && <span className="ml-auto bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">{item.badge}</span>}{item.external && !collapsed && <ExternalLink size={13} className="ml-auto" />}{hasChildren && !collapsed && <ChevronDown size={14} className={`ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`} />}{active && <ActiveMenuIndicator navbar={layout === 'navbar'} />}</>

  const children = visibleChildren.map((child) => <MenuItem key={child.id} item={child} depth={depth + 1} collapsed={false} layout="sidebar" onNavigate={onNavigate} role="menuitem" />)
  const flyoutContents = <><p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</p><ul className="space-y-1">{children}</ul></>
  const navbarDropdownContents = (
    <>
      <div className="sticky top-0 z-10 mb-1 flex items-center justify-between rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">{item.label}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Choose a destination</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          {visibleChildren.length} {visibleChildren.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2 p-1 lg:grid-cols-3 [&>li]:rounded-2xl [&>li]:border [&>li]:border-slate-100 [&>li]:bg-slate-50/60 [&>li]:p-1 [&>li]:transition-colors hover:[&>li]:border-slate-200 dark:[&>li]:border-white/[.06] dark:[&>li]:bg-white/[.025]">{children}</ul>
    </>
  )

  return (
    <RestrictedItem item={item}>
      <li ref={rootRef} className={`relative ${layout === 'navbar' ? 'h-full' : ''}`} onKeyDown={keyboard} onMouseEnter={() => { if (isCollapsedFlyout && !item.disabled) keepFlyoutOpen() }} onMouseLeave={() => { if (isCollapsedFlyout) scheduleFlyoutClose() }}>
        {item.external && (item.route ?? item.path) ? (
          <a ref={triggerRef as React.RefObject<HTMLAnchorElement>} id={labelId} href={item.route ?? item.path} target="_blank" rel="noreferrer" role={role} aria-disabled={item.disabled} tabIndex={item.disabled ? -1 : 0} aria-label={collapsed ? item.label : undefined} style={spacing} className={classes} onClick={(event) => { if (item.disabled) event.preventDefault() }}>{content}</a>
        ) : (
          <button ref={triggerRef as React.RefObject<HTMLButtonElement>} id={collapsed ? labelId : undefined} type="button" role={role} disabled={item.disabled} aria-label={collapsed ? item.label : undefined} aria-current={active ? 'page' : undefined} aria-expanded={hasChildren ? expanded : undefined} aria-haspopup={hasChildren ? 'menu' : undefined} style={spacing} className={classes} onClick={activate}>{content}</button>
        )}

        {isCollapsedFlyout && <CollapsedMenuTooltip open={expanded} labelledBy={labelId} anchorRef={triggerRef} onMouseEnter={keepFlyoutOpen} onMouseLeave={scheduleFlyoutClose}>{hasChildren ? flyoutContents : <span className="block whitespace-nowrap px-2 py-1 text-sm font-medium">{item.label}</span>}</CollapsedMenuTooltip>}
        {isNavbarDropdown && hasChildren && <NavbarDropdown open={expanded} labelledBy={labelId} position={dropdownPosition}>{navbarDropdownContents}</NavbarDropdown>}
        {!collapsed && layout === 'sidebar' && hasChildren && (
          <AnimatePresence initial={false}>{expanded && <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.16 }} className="ml-3 mt-1 space-y-1 overflow-hidden border-l border-slate-200/80 pl-2 dark:border-white/10">{children}</motion.ul>}</AnimatePresence>
        )}
      </li>
    </RestrictedItem>
  )
}

export function NavigationGenerator({ menuItems, collapsed, layout, ariaLabel = 'Main navigation', onNavigate }: NavigationGeneratorProps) {
  const { pathname } = useLocation()
  return <nav aria-label={ariaLabel} className={layout === 'navbar' ? 'h-full' : undefined}><ul key={pathname} className={layout === 'navbar' ? 'flex h-full items-stretch' : 'space-y-1'}>{menuItems.filter((item) => item.is_visible !== false).map((item) => <MenuItem key={item.id} item={item} depth={0} collapsed={collapsed} layout={layout} onNavigate={onNavigate} />)}</ul></nav>
}
