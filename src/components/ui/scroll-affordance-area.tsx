import * as React from 'react';
import { cn } from '@/lib/utils';
import { useScrollAffordance } from '@/hooks/useScrollAffordance';

export interface ScrollAffordanceAreaProps {
  className?: string;
  /** Inner content rendered inside the scrolling viewport. */
  children: React.ReactNode;
  /** Optional ref populated with the scrolling element (the viewport). */
  viewportRef?: React.MutableRefObject<HTMLElement | null>;
  /**
   * Optional alias of `viewportRef` for legacy consumers that historically held
   * a separate ref to a wrapping "scroll area root". With the plain-div design,
   * root and viewport are the same element.
   */
  rootRef?: React.MutableRefObject<HTMLDivElement | null>;
  /** Optional small "{itemCount} {noun}" label rendered above the viewport. */
  itemCount?: number;
  noun?: string;
  orientation?: 'vertical' | 'horizontal';
  bgVar?: string;
  /** When false, the scroll track/thumb are hidden (fade overlays still render). */
  showScrollbar?: boolean;
  /** Called on every scroll event. */
  onScroll?: () => void;
}

/**
 * Composable scroll surface with fade overlays at start/end and an optional
 * custom scroll track/thumb. Uses a plain `<div>` (no Radix) so the viewport
 * element is exactly the consumer's `viewportRef`, with native scrolling intact.
 */
export const ScrollAffordanceArea = React.forwardRef<HTMLDivElement, ScrollAffordanceAreaProps>(
  function ScrollAffordanceArea(
    {
      className,
      children,
      viewportRef: viewportRefProp,
      rootRef: rootRefProp,
      itemCount,
      noun = 'items',
      orientation = 'vertical',
      bgVar = 'background',
      showScrollbar = true,
      onScroll,
    },
    forwardedRef,
  ) {
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const fadeStartRef = React.useRef<HTMLDivElement>(null);
    const fadeEndRef = React.useRef<HTMLDivElement>(null);
    const trackRef = React.useRef<HTMLDivElement>(null);
    const thumbRef = React.useRef<HTMLDivElement>(null);

    const assignViewportRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        viewportRef.current = node;
        if (viewportRefProp) viewportRefProp.current = node;
        if (rootRefProp) rootRefProp.current = node;
      },
      [viewportRefProp, rootRefProp],
    );

    useScrollAffordance({
      containerRef: viewportRef,
      fadeStartRef,
      fadeEndRef,
      trackRef: showScrollbar ? trackRef : undefined,
      thumbRef: showScrollbar ? thumbRef : undefined,
      orientation,
      bgVar,
      showScrollbar,
      onScroll,
    });

    const isHorizontal = orientation === 'horizontal';

    return (
      <div
        ref={forwardedRef}
        className={cn(
          'scroll-affordance-wrapper relative flex flex-col min-h-0 overflow-hidden',
          className,
        )}
      >
        {itemCount !== undefined && (
          <div className="scroll-affordance-count shrink-0 px-2 py-0.5 text-right text-xs text-muted-foreground">
            {itemCount} {noun}
          </div>
        )}
        <div className="relative min-h-0 flex-1">
          <div
            ref={assignViewportRef}
            // `data-radix-scroll-area-viewport` is kept for backwards compatibility
            // with legacy DOM queries that hunt for the scroll viewport by selector.
            data-radix-scroll-area-viewport=""
            className={cn(
              'h-full w-full overscroll-contain [overflow-anchor:auto]',
              '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
              isHorizontal
                ? 'overflow-x-auto overflow-y-hidden'
                : 'overflow-y-auto overflow-x-hidden',
              showScrollbar && !isHorizontal && 'pr-2.5',
            )}
          >
            {children}
          </div>
          <div ref={fadeStartRef} aria-hidden />
          <div ref={fadeEndRef} aria-hidden />
          {showScrollbar && (
            <div ref={trackRef} aria-hidden>
              <div ref={thumbRef} />
            </div>
          )}
        </div>
      </div>
    );
  },
);

ScrollAffordanceArea.displayName = 'ScrollAffordanceArea';

/** Same as `ScrollAffordanceArea`, but the scroll track/thumb are hidden. */
export function ContentScrollAffordanceArea(
  props: Omit<ScrollAffordanceAreaProps, 'showScrollbar'>,
) {
  return <ScrollAffordanceArea {...props} showScrollbar={false} />;
}
