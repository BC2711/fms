import { useEffect, useState, type PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { AppRouter } from '@/app/router/AppRouter'
import { getAllPageConfigs } from '@/config/page-registry'
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { apiClient } from '@/services/api-client'
import { installMockApi } from '@/services/mock-api'
import { ToastContainer } from '@/components/feedback/ToastContainer'

function ConfigInitializer({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(!import.meta.env.DEV)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    getAllPageConfigs().forEach((config) => validateConfig(config.id, pageConfigSchema, config))
    const restore = import.meta.env.VITE_USE_MOCK_API === 'true' ? installMockApi(apiClient) : undefined
    setReady(true)
    return () => restore?.()
  }, [])
  return ready ? children : <div role="status">Initializing application…</div>
}

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <ConfigInitializer>
            <BrowserRouter><AppRouter /><ToastContainer /></BrowserRouter>
          </ConfigInitializer>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
