import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip'
import { useIsTouch } from '@/hooks/useIsTouch'

interface HeaderIconProps {
  tooltip: string
  children: React.ReactNode
  tooltipOpen?: boolean
  onTooltipOpenChange?: (open: boolean) => void
}

const HeaderIcon: React.FC<HeaderIconProps> = ({ tooltip, children, tooltipOpen, onTooltipOpenChange }) => {
  const isTouch = useIsTouch()
  if (isTouch) {
    // On touch devices, tooltips are generally not shown via hover,
    // so we bypass the tooltip logic entirely.
    return <>{children}</>
  }
  return (
    <div className="relative group outline-none">
      <Tooltip open={tooltipOpen} onOpenChange={onTooltipOpenChange}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        {/* Conditionally render TooltipContent only if not controlled to be closed,
            or let Radix handle it if controlled.
            This primarily handles the case where an uncontrolled tooltip should still appear.
            If tooltipOpen is explicitly false, Radix <Tooltip open={false}> will prevent content.
        */}
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default HeaderIcon
