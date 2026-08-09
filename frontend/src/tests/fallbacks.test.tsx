import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { getComponent } from '@/framework/registry/component-registry'
import { getIcon } from '@/framework/registry/icon-registry'
import { DynamicComponent } from '@/framework/runtime/DynamicComponent'
import { DynamicIcon } from '@/framework/runtime/DynamicIcon'

describe('controlled registry fallbacks', () => {
  it('returns and renders HelpCircle for unknown icons', () => { expect(getIcon('missing')).toBe(getIcon('another-missing-icon')); const { container } = render(<DynamicIcon iconKey="missing" />); expect(container.querySelector('svg')).toBeInTheDocument() })
  it('returns and renders the safe component fallback', () => { expect(getComponent('missing')).toBeDefined(); render(<DynamicComponent componentKey="missing" />); expect(screen.getByRole('alert')).toHaveTextContent('Component "missing" is not registered') })
})
