import { render, screen } from '@testing-library/react'
import { HelpCircle } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { getComponent, MissingComponent, registerComponent } from '@/framework/registry/component-registry'
import { getIcon } from '@/framework/registry/icon-registry'

describe('controlled registries', () => {
  it('returns HelpCircle when an icon key is not registered', () => {
    expect(getIcon('nonexistent')).toBe(HelpCircle)
  })

  it('returns the safe fallback when a component key is not registered', () => {
    expect(getComponent('nonexistent')).toBe(MissingComponent)
    const Fallback = getComponent<{ componentKey: string }>('nonexistent')
    render(<Fallback componentKey="nonexistent" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Component "nonexistent" is not registered')
  })

  it('registers and retrieves a typed component', () => {
    const Example = ({ label }: { label: string }) => <span>{label}</span>
    registerComponent('example', Example)
    const Registered = getComponent<{ label: string }>('example')
    render(<Registered label="Registered component" />)
    expect(screen.getByText('Registered component')).toBeInTheDocument()
  })
})
