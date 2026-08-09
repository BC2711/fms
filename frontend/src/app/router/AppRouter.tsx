import { Navigate, Route, Routes } from 'react-router-dom'

import { pageRegistry } from '@/config/page-registry'
import { generateRoutes, UnauthorizedPage } from '@/framework/generators/RouteGenerator'
import { GeneratedMenuPage } from '@/framework/generators/GeneratedMenuPage'
import { AppShell } from '@/layouts/AppShell'

export function AppRouter() {
  return (
    <Routes>
      {generateRoutes(pageRegistry, { layout: 'standalone', includeNotFound: false })}
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {generateRoutes(pageRegistry, { layout: 'application', includeNotFound: false })}
        <Route path="*" element={<GeneratedMenuPage />} />
      </Route>
    </Routes>
  )
}
