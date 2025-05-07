import React from 'react';
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle = true,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-2 items-center justify-center bg-secondary transition-colors duration-300",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "data-[panel-group-direction=vertical]:h-2 data-[panel-group-direction=vertical]:w-full",
      "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1",
      "data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2",
      "data-[panel-group-direction=vertical]:after:translate-x-0",
      "cursor-col-resize data-[panel-group-direction=vertical]:cursor-row-resize",
      "[&[data-panel-group-direction=vertical]>div]:rotate-90",
      "[&:not([data-panel-group-direction=vertical])>div]:rotate-0",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-8 w-4 items-center justify-center rounded-full border border-border bg-background shadow-lg hover:shadow-xl transition-shadow duration-300 group">
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-col gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-0.5 w-2 bg-muted-foreground group-hover:bg-foreground transition-colors duration-300"
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 h-full rounded-full bg-gradient-to-b from-transparent via-muted/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
