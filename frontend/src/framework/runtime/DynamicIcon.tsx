import { memo } from 'react'

import { getIcon } from '@/framework/registry/icon-registry'

export interface DynamicIconProps {
  iconKey: string
  className?: string
  size?: number
}

export const DynamicIcon = memo(function DynamicIcon({ iconKey, className, size }: DynamicIconProps) {
  const Icon = getIcon(iconKey)
  return <Icon className={className} size={size} aria-hidden="true" />
})
