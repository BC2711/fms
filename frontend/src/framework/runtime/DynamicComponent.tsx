import type { ComponentType, ReactNode } from 'react'

import { componentRegistry, getComponent } from '@/framework/registry/component-registry'

export type DynamicComponentProps<P extends object> = P & {
  componentKey: string
  fallback?: ReactNode
}

export function DynamicComponent<P extends object>({
  componentKey,
  fallback,
  ...props
}: DynamicComponentProps<P>) {
  if (!componentRegistry[componentKey] && fallback !== undefined) return <>{fallback}</>

  const Component = getComponent<P>(componentKey) as ComponentType<P & { componentKey?: string }>
  return <Component {...(props as P)} componentKey={componentKey} />
}
