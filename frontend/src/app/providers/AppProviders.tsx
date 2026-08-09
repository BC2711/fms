import type { PropsWithChildren } from 'react'

import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider><AuthProvider><ThemeProvider>{children}</ThemeProvider></AuthProvider></QueryProvider>
  )
}
