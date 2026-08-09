import { createElement, type ComponentType } from 'react'

type RegistryComponent = ComponentType<Record<string, unknown>>

export const MissingComponent = ({ componentKey }: { componentKey?: string }) => {
  if (import.meta.env.DEV) {
    return createElement(
      'div',
      { role: 'alert', className: 'rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700' },
      `Component "${componentKey ?? 'unknown'}" is not registered.`,
    )
  }

  return createElement('div', { hidden: true })
}

export const componentRegistry: Record<string, RegistryComponent> = {}

export function registerComponent<P extends object>(key: string, component: ComponentType<P>): void {
  if (!key.trim()) throw new Error('Component registry key cannot be empty')
  componentRegistry[key] = component as unknown as RegistryComponent
}

export function getComponent<P extends object = Record<string, unknown>>(key: string): ComponentType<P> {
  return (componentRegistry[key] ?? MissingComponent) as unknown as ComponentType<P>
}
