import { useCallback, useState } from 'react'

export type LayoutType = 'mac-sidebar' | 'windows-navbar'

const STORAGE_KEY = 'fms.layout'

function readPreference(): LayoutType {
  if (typeof localStorage === 'undefined') return 'mac-sidebar'
  return localStorage.getItem(STORAGE_KEY) === 'windows-navbar' ? 'windows-navbar' : 'mac-sidebar'
}

export function useLayoutPreference(): [LayoutType, (layout: LayoutType) => void] {
  const [layout, setLayoutState] = useState<LayoutType>(readPreference)
  const setLayout = useCallback((nextLayout: LayoutType) => {
    localStorage.setItem(STORAGE_KEY, nextLayout)
    setLayoutState(nextLayout)
  }, [])
  return [layout, setLayout]
}
