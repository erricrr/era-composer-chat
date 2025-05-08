import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip'
import { useIsTouch } from '@/hooks/useIsTouch'

interface HeaderIconProps {
  tooltip: string
  children: React.ReactNode
}

const HeaderIcon: React.FC<HeaderIconProps> = ({ tooltip, children }) => {
  const isTouch = useIsTouch()
  if (isTouch) {
    return <>{children}</>
  }
  return (
    <div className="relative group">
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default HeaderIcon
