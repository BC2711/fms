import { type ReactElement, Suspense } from 'react'
import { Navigate, Route, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Home, Search, FileQuestion, ShieldAlert } from 'lucide-react'

import { canAccessPage } from '@/auth/permissions'
import { useAuthStore } from '@/auth/auth.store'
import { PageGenerator } from '@/framework/generators/PageGenerator'
import type { PageConfig } from '@/types/configuration.types'

// ============================================================================
// Error Background Component
// ============================================================================

function ErrorBackground({ variant = 'blue' }: { variant?: 'blue' | 'amber' }) {
  const isAmber = variant === 'amber'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl ${isAmber
            ? 'bg-amber-100/50 dark:bg-amber-900/20'
            : 'bg-blue-100/50 dark:bg-blue-900/20'
          }`}
      />
      <div
        className={`absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl ${isAmber
            ? 'bg-red-100/50 dark:bg-red-900/20'
            : 'bg-purple-100/50 dark:bg-purple-900/20'
          }`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[size:32px_32px] text-gray-200/50 dark:text-gray-800/50" />
    </div>
  )
}

// ============================================================================
// Error Illustration Component
// ============================================================================

function ErrorIllustration({ type }: { type: '404' | '403' }) {
  const is403 = type === '403'
  const Icon = is403 ? ShieldAlert : FileQuestion
  const dotColors = is403
    ? ['bg-amber-400/60 dark:bg-amber-500/40', 'bg-red-400/60 dark:bg-red-500/40']
    : ['bg-blue-400/60 dark:bg-blue-500/40', 'bg-purple-400/60 dark:bg-purple-500/40']

  return (
    <div className="relative mb-8">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-white shadow-2xl shadow-gray-200/50 ring-1 ring-gray-200 dark:from-gray-800 dark:to-gray-900 dark:shadow-gray-900/50 dark:ring-gray-700 md:h-40 md:w-40">
        <Icon
          size={64}
          className="text-gray-400 dark:text-gray-500"
          strokeWidth={1.5}
        />
      </div>
      <div className="absolute -right-4 -top-4 flex gap-2">
        <div className={`h-3 w-3 rounded-full ${dotColors[0]}`} />
        <div className={`h-3 w-3 rounded-full ${dotColors[1]}`} />
      </div>
    </div>
  )
}

// ============================================================================
// Error Code Display
// ============================================================================

function ErrorCode({ code }: { code: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.span
      initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-7xl font-black leading-none text-transparent dark:from-white dark:to-gray-400 sm:text-8xl lg:text-9xl"
    >
      {code}
    </motion.span>
  )
}

// ============================================================================
// Action Buttons
// ============================================================================

function BackButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
      <span>Go back</span>
    </button>
  )
}

function HomeButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
    >
      <Home size={16} />
      <span>Back to home</span>
    </button>
  )
}

function SearchDocsButton() {
  return (
    <button
      type="button"
      className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <Search size={16} />
      <span>Search docs</span>
    </button>
  )
}

function RequestAccessButton() {
  return (
    <button
      type="button"
      className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <ShieldAlert size={16} />
      <span>Request access</span>
    </button>
  )
}

// ============================================================================
// Error Page Components
// ============================================================================

export function NotFoundPage() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative flex h-70 min-h-0 w-full items-center justify-center overflow-hidden bg-white px-4 py-8 dark:bg-gray-950 sm:px-6">
      <ErrorBackground variant="blue" />

      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex max-h-full w-full max-w-2xl flex-col items-center overflow-y-auto py-4 text-center"
      >
        {/* <ErrorIllustration type="404" /> */}
        <ErrorCode code="404" />

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-4 space-y-3"
        >
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
            Page not found
          </h1>
          <p className="mx-auto max-w-md text-base text-gray-500 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for. It might have been
            moved, deleted, or never existed.
          </p>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <BackButton />
          <HomeButton />
          <SearchDocsButton />
        </motion.div>

        <motion.p
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-12 text-xs text-gray-400 dark:text-gray-600"
        >
          Need help? Contact{' '}
          <a
            href="mailto:support@example.com"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            support@example.com
          </a>
        </motion.p>
      </motion.section>
    </div>
  )
}

export function UnauthorizedPage() {
  const reducedMotion = useReducedMotion()
  const location = useLocation()
  const state = location.state as { from?: string; reason?: string } | null

  return (
    <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-white px-4 py-8 dark:bg-gray-950 sm:px-6">
      <ErrorBackground variant="amber" />

      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex max-h-full w-full max-w-2xl flex-col items-center overflow-y-auto py-4 text-center"
      >
        <ErrorIllustration type="403" />
        <ErrorCode code="403" />

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-4 space-y-3"
        >
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
            Access denied
          </h1>
          <div className="mx-auto max-w-md space-y-1">
            <p className="text-base text-gray-500 dark:text-gray-400">
              You don't have permission to access this page.
            </p>
            {state?.reason && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {state.reason === 'authentication'
                  ? 'You need to sign in first.'
                  : "Your account doesn't have the required permissions."}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <BackButton />
          <HomeButton />
          <RequestAccessButton />
        </motion.div>

        <motion.p
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-12 text-xs text-gray-400 dark:text-gray-600"
        >
          Need help? Contact{' '}
          <a
            href="mailto:support@example.com"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            support@example.com
          </a>
        </motion.p>
      </motion.section>
    </div>
  )
}

// ============================================================================
// Loading Component
// ============================================================================

function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-3 border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-900/80" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading page...
        </p>
      </motion.div>
    </div>
  )
}

// ============================================================================
// Page Transition Wrapper
// ============================================================================

function PageTransition({ children }: { children: ReactElement }) {
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// Protected Route Component
// ============================================================================

interface ProtectedRouteProps {
  config: PageConfig
  children: ReactElement
}

function ProtectedRoute({ config, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (config.authentication?.required && isLoading) return <PageLoader />

  if (config.authentication?.required && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, reason: 'authentication' }}
        replace
      />
    )
  }

  if (config.permissions && !canAccessPage(user, config)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location.pathname, reason: 'permissions' }}
        replace
      />
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  )
}

// ============================================================================
// Route Joining Utility
// ============================================================================

function joinRoute(parent: string, child: string): string {
  if (child.startsWith('/')) return child

  const normalizedParent = parent.replace(/\/$/, '')
  const normalizedChild = child.replace(/^\//, '')

  return `${normalizedParent}/${normalizedChild}`
}

// ============================================================================
// Route Configuration Generator
// ============================================================================

function configRoutes(config: PageConfig, parentRoute = ''): ReactElement[] {
  const configuredRoute = config.route ?? config.path

  if (!configuredRoute) {
    console.warn(`Page "${config.id}" has no route configured`)
    return []
  }

  const route = parentRoute
    ? joinRoute(parentRoute, configuredRoute)
    : configuredRoute

  const element = (
    <Route
      key={config.id}
      path={route}
      element={
        <ProtectedRoute config={config}>
          <PageGenerator pageKey={config.id} />
        </ProtectedRoute>
      }
    />
  )

  const childRoutes =
    config.sub_pages?.flatMap((child) => configRoutes(child, route)) ?? []

  return [element, ...childRoutes]
}

// ============================================================================
// Route Generator Options
// ============================================================================

export interface GenerateRoutesOptions {
  /** Filter routes by layout type */
  layout?: 'application' | 'standalone'
  /** Include 404 catch-all route */
  includeNotFound?: boolean
  /** Include 403 unauthorized route */
  includeUnauthorized?: boolean
  /** Custom not found element */
  notFoundElement?: ReactElement
  /** Custom unauthorized element */
  unauthorizedElement?: ReactElement
}

// ============================================================================
// Main Route Generator
// ============================================================================

export function generateRoutes(
  registry: Record<string, PageConfig>,
  options: GenerateRoutesOptions = {}
): ReactElement[] {
  const {
    layout,
    includeNotFound = true,
    includeUnauthorized = false,
    notFoundElement,
    unauthorizedElement,
  } = options

  const pages = Object.values(registry)
    .filter((config) => {
      if (config.parentId) return false
      if (layout) return (config.layout ?? 'application') === layout
      return true
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const routes: ReactElement[] = pages.flatMap((config) => configRoutes(config))

  if (includeUnauthorized) {
    routes.push(
      <Route
        key="unauthorized"
        path="/unauthorized"
        element={
          <Suspense fallback={<PageLoader />}>
            {unauthorizedElement ?? <UnauthorizedPage />}
          </Suspense>
        }
      />
    )
  }

  if (includeNotFound) {
    routes.push(
      <Route
        key="not-found"
        path="*"
        element={
          <Suspense fallback={<PageLoader />}>
            {notFoundElement ?? <NotFoundPage />}
          </Suspense>
        }
      />
    )
  }

  return routes
}

// ============================================================================
// Route Generator Component
// ============================================================================

interface RouteGeneratorProps {
  pageRegistry: Record<string, PageConfig>
  options?: Omit<GenerateRoutesOptions, 'includeNotFound' | 'includeUnauthorized'>
}

export function RouteGenerator({ pageRegistry, options }: RouteGeneratorProps) {
  return <>{generateRoutes(pageRegistry, options)}</>
}
