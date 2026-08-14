import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLayoutPreference } from '@/hooks/useLayoutPreference'
import { LayoutSwitcher } from '@/layouts/components/LayoutSwitcher'

describe('layout switching', () => {
  beforeEach(() => localStorage.removeItem('fms.layout'))
  it('toggles using LayoutSwitcher', () => { const change = vi.fn(); render(<LayoutSwitcher layout="mac-sidebar" onChange={change} />); fireEvent.click(screen.getByRole('button', { name: /Current layout: Sidebar/ })); fireEvent.click(screen.getByRole('menuitem', { name: /Navbar/ })); expect(change).toHaveBeenCalledWith('windows-navbar') })
  it('persists and restores preference', () => { const first = renderHook(() => useLayoutPreference()); act(() => first.result.current[1]('windows-navbar')); expect(localStorage.getItem('fms.layout')).toBe('windows-navbar'); first.unmount(); const restored = renderHook(() => useLayoutPreference()); expect(restored.result.current[0]).toBe('windows-navbar') })
})
