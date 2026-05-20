import { useEffect, useRef, useCallback } from 'react';

type Orientation = 'vertical' | 'horizontal';

export interface UseScrollAffordanceParams {
  /** The element that actually scrolls. */
  containerRef: React.RefObject<HTMLElement | null>;
  fadeStartRef: React.RefObject<HTMLDivElement | null>;
  fadeEndRef: React.RefObject<HTMLDivElement | null>;
  /** Optional: when present (and `showScrollbar`), thumb position is updated on scroll. */
  trackRef?: React.RefObject<HTMLDivElement | null>;
  thumbRef?: React.RefObject<HTMLDivElement | null>;
  orientation?: Orientation;
  /** CSS custom property name used to color the fade gradient (e.g. 'background'). */
  bgVar?: string;
  /** When false, scrollbar is never styled (fades only). */
  showScrollbar?: boolean;
  /** Called on every scroll event after fade/thumb updates. */
  onScroll?: () => void;
}

// Single source of truth for scrollbar appearance.
export const SCROLLBAR_THICKNESS = 4;
export const SCROLLBAR_GUTTER = 10;
const SCROLLBAR_THUMB_COLOR = 'hsl(var(--border))';
const SCROLLBAR_TRACK_COLOR = 'hsl(var(--border) / 0.4)';
const SCROLLBAR_RADIUS = 3;
const SCROLLBAR_MIN_THUMB = 24;

type OrientationConfig = {
  scrollPos: (el: HTMLElement) => number;
  scrollSize: (el: HTMLElement) => number;
  clientSize: (el: HTMLElement) => number;
  trackSize: (el: HTMLElement) => number;
  thumbTransform: (pos: number) => string;
  thumbSizeStyle: (size: number) => { width: string; height: string };
  hiddenThumbSize: { width: string; height: string };
  fadeStartStyle: (bgVar: string) => string;
  fadeEndStyle: (bgVar: string) => string;
  trackStyle: string;
  thumbStyle: string;
};

const VERTICAL_CONFIG: OrientationConfig = {
  scrollPos: (el) => el.scrollTop,
  scrollSize: (el) => el.scrollHeight,
  clientSize: (el) => el.clientHeight,
  trackSize: (el) => el.clientHeight,
  thumbTransform: (pos) => `translateY(${pos}px)`,
  thumbSizeStyle: (size) => ({ width: `${SCROLLBAR_THICKNESS}px`, height: `${size}px` }),
  hiddenThumbSize: { width: `${SCROLLBAR_THICKNESS}px`, height: '0px' },
  fadeStartStyle: (bgVar) =>
    `position:absolute;top:0;left:0;right:0;height:32px;background:linear-gradient(to bottom,hsl(var(--${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;`,
  fadeEndStyle: (bgVar) =>
    `position:absolute;bottom:0;left:0;right:0;height:32px;background:linear-gradient(to top,hsl(var(--${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;`,
  trackStyle: `position:absolute;right:4px;top:4px;bottom:4px;width:${SCROLLBAR_THICKNESS}px;background:${SCROLLBAR_TRACK_COLOR};border-radius:${SCROLLBAR_RADIUS}px;z-index:1;pointer-events:none;`,
  thumbStyle: `position:absolute;background:${SCROLLBAR_THUMB_COLOR};border-radius:${SCROLLBAR_RADIUS}px;min-height:${SCROLLBAR_MIN_THUMB}px;`,
};

const HORIZONTAL_CONFIG: OrientationConfig = {
  scrollPos: (el) => el.scrollLeft,
  scrollSize: (el) => el.scrollWidth,
  clientSize: (el) => el.clientWidth,
  trackSize: (el) => el.clientWidth,
  thumbTransform: (pos) => `translateX(${pos}px)`,
  thumbSizeStyle: (size) => ({ width: `${size}px`, height: `${SCROLLBAR_THICKNESS}px` }),
  hiddenThumbSize: { width: '0px', height: `${SCROLLBAR_THICKNESS}px` },
  fadeStartStyle: (bgVar) =>
    `position:absolute;top:0;left:0;bottom:0;width:32px;background:linear-gradient(to right,hsl(var(--${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;contain:paint;`,
  fadeEndStyle: (bgVar) =>
    `position:absolute;top:0;right:0;bottom:0;width:32px;background:linear-gradient(to left,hsl(var(--${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;contain:paint;`,
  trackStyle: `position:absolute;left:4px;right:4px;bottom:0;height:${SCROLLBAR_THICKNESS}px;background:${SCROLLBAR_TRACK_COLOR};border-radius:${SCROLLBAR_RADIUS}px;z-index:2;pointer-events:none;contain:paint;`,
  thumbStyle: `position:absolute;background:${SCROLLBAR_THUMB_COLOR};border-radius:${SCROLLBAR_RADIUS}px;min-width:${SCROLLBAR_MIN_THUMB}px;`,
};

function getConfig(orientation: Orientation): OrientationConfig {
  return orientation === 'horizontal' ? HORIZONTAL_CONFIG : VERTICAL_CONFIG;
}

/**
 * Scroll affordance behavior: animates fade opacity + thumb position on scroll.
 * Owns no DOM — render the overlay elements in React and pass their refs.
 */
export function useScrollAffordance({
  containerRef,
  fadeStartRef,
  fadeEndRef,
  trackRef,
  thumbRef,
  orientation = 'vertical',
  bgVar = 'background',
  showScrollbar = true,
  onScroll,
}: UseScrollAffordanceParams) {
  const rafIdRef = useRef<number | null>(null);
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;

  const config = getConfig(orientation);

  // Apply the static overlay styles once on mount (and whenever bg/orientation change).
  useEffect(() => {
    const fadeStart = fadeStartRef.current;
    const fadeEnd = fadeEndRef.current;
    if (fadeStart) fadeStart.style.cssText = config.fadeStartStyle(bgVar);
    if (fadeEnd) fadeEnd.style.cssText = config.fadeEndStyle(bgVar);

    const track = trackRef?.current;
    const thumb = thumbRef?.current;
    if (showScrollbar && track && thumb) {
      track.style.cssText = config.trackStyle;
      thumb.style.cssText = config.thumbStyle;
    }
  }, [config, bgVar, showScrollbar, fadeStartRef, fadeEndRef, trackRef, thumbRef]);

  // Recompute fade/thumb visuals only (safe to call on resize before scroll position is restored).
  const updateVisuals = useCallback(() => {
    const container = containerRef.current;
    const fadeStart = fadeStartRef.current;
    const fadeEnd = fadeEndRef.current;
    if (!container || !fadeStart || !fadeEnd) return;

    const scrollPos = config.scrollPos(container);
    const scrollSize = config.scrollSize(container);
    const clientSize = config.clientSize(container);

    // Fades
    const startOpacity = scrollPos <= 1 ? '0' : '1';
    const endOpacity = scrollPos >= scrollSize - clientSize - 1 ? '0' : '1';
    if (fadeStart.style.opacity !== startOpacity) fadeStart.style.opacity = startOpacity;
    if (fadeEnd.style.opacity !== endOpacity) fadeEnd.style.opacity = endOpacity;

    // Thumb (only when scrollbar is shown)
    const track = trackRef?.current;
    const thumb = thumbRef?.current;
    if (showScrollbar && track && thumb) {
      if (scrollSize <= clientSize) {
        thumb.style.width = config.hiddenThumbSize.width;
        thumb.style.height = config.hiddenThumbSize.height;
      } else {
        const trackSize = config.trackSize(track);
        const thumbSize = Math.max(SCROLLBAR_MIN_THUMB, (clientSize / scrollSize) * trackSize);
        const trackScrollableDistance = trackSize - thumbSize;
        const scrollableDistance = scrollSize - clientSize;
        const thumbPos = scrollPos > 0 && scrollableDistance > 0
          ? (scrollPos / scrollableDistance) * trackScrollableDistance
          : 0;
        const sizeStyle = config.thumbSizeStyle(thumbSize);
        thumb.style.width = sizeStyle.width;
        thumb.style.height = sizeStyle.height;
        thumb.style.transform = config.thumbTransform(thumbPos);
      }
    }
  }, [config, containerRef, fadeStartRef, fadeEndRef, trackRef, thumbRef, showScrollbar]);

  const notifyScroll = useCallback(() => {
    updateVisuals();
    onScrollRef.current?.();
  }, [updateVisuals]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        notifyScroll();
      });
    };

    const handleResize = () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateVisuals();
      });
    };

    // Initial sync (covers post-mount, content size changes, ref attach).
    updateVisuals();
    onScrollRef.current?.();
    container.addEventListener('scroll', handleScroll, { passive: true });

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      container.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, [containerRef, updateVisuals, notifyScroll]);
}
