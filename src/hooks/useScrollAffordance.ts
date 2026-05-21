import { useEffect, useRef, useCallback, type CSSProperties } from 'react';

type Orientation = 'vertical' | 'horizontal';

export interface UseScrollAffordanceParams {
  /** The element that actually scrolls. */
  containerRef: React.RefObject<HTMLElement | null>;
  fadeStartRef: React.RefObject<HTMLDivElement | null>;
  fadeEndRef: React.RefObject<HTMLDivElement | null>;
  /** Optional: when present (and `showScrollbar`), thumb position is updated on scroll. */
  trackRef?: React.RefObject<HTMLDivElement | null>;
  thumbRef?: React.RefObject<HTMLDivElement | null>;
  /** Optional: inner content wrapper; gutter padding toggles when overflow appears. */
  contentRef?: React.RefObject<HTMLElement | null>;
  orientation?: Orientation;
  /** CSS custom property name used to color the fade gradient (e.g. 'background'). */
  bgVar?: string;
  /** When false, scrollbar is never styled (fades only). */
  showScrollbar?: boolean;
  /** When false, the end fade overlay stays hidden. Defaults to true. */
  showEndFade?: boolean;
  /** Called on every scroll event after fade/thumb updates. */
  onScroll?: () => void;
}

// Single source of truth for scrollbar layout and appearance.
export const SCROLLBAR_THICKNESS = 4;
/** Space reserved beside content when scrollable (matches thumb thickness). */
export const SCROLLBAR_GUTTER = SCROLLBAR_THICKNESS;
/** Inset of the track from the start/end edges along the scroll axis. */
export const SCROLLBAR_TRACK_INSET = 4;

/** Padding on scrollable content so text does not sit under the custom thumb. */
export function scrollAffordanceContentGutterStyle(
  scrollable: boolean,
  orientation: Orientation = 'vertical',
): CSSProperties | undefined {
  if (!scrollable) return undefined;
  if (orientation === 'horizontal') {
    return { paddingBottom: SCROLLBAR_GUTTER };
  }
  return { paddingRight: SCROLLBAR_GUTTER };
}
const SCROLLBAR_THUMB_COLOR = 'hsl(var(--border))';
const SCROLLBAR_TRACK_COLOR = 'hsl(var(--border) / 0.4)';
const SCROLLBAR_RADIUS = 3;
const SCROLLBAR_MIN_THUMB = 24;

type OrientationConfig = {
  scrollPos: (el: HTMLElement) => number;
  setScrollPos: (el: HTMLElement, pos: number) => void;
  scrollSize: (el: HTMLElement) => number;
  clientSize: (el: HTMLElement) => number;
  trackSize: (el: HTMLElement) => number;
  pointerPos: (event: PointerEvent) => number;
  trackPointerOffset: (trackRect: DOMRect, event: PointerEvent) => number;
  thumbTransform: (pos: number) => string;
  thumbSizeStyle: (size: number) => { width: string; height: string };
  hiddenThumbSize: { width: string; height: string };
  fadeStartStyle: (bgVar: string) => string;
  fadeEndStyle: (bgVar: string) => string;
  trackStyle: string;
  thumbStyle: string;
};

const VERTICAL_TRACK_BG = `linear-gradient(to right,${SCROLLBAR_TRACK_COLOR} ${SCROLLBAR_THICKNESS}px,transparent ${SCROLLBAR_THICKNESS}px)`;

const VERTICAL_CONFIG: OrientationConfig = {
  scrollPos: (el) => el.scrollTop,
  setScrollPos: (el, pos) => {
    el.scrollTop = pos;
  },
  scrollSize: (el) => el.scrollHeight,
  clientSize: (el) => el.clientHeight,
  trackSize: (el) => el.clientHeight,
  pointerPos: (event) => event.clientY,
  trackPointerOffset: (trackRect, event) => event.clientY - trackRect.top,
  thumbTransform: (pos) => `translateY(${pos}px)`,
  thumbSizeStyle: (size) => ({ width: `${SCROLLBAR_THICKNESS}px`, height: `${size}px` }),
  hiddenThumbSize: { width: `${SCROLLBAR_THICKNESS}px`, height: '0px' },
  fadeStartStyle: (bgVar) =>
    `position:absolute;top:0;left:0;right:0;height:32px;background:linear-gradient(to bottom,hsl(var(--${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;`,
  fadeEndStyle: (bgVar) =>
    `position:absolute;bottom:0;left:0;right:0;height:32px;background:linear-gradient(to top,hsl(var(--${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;`,
  trackStyle: `position:absolute;right:0;top:${SCROLLBAR_TRACK_INSET}px;bottom:${SCROLLBAR_TRACK_INSET}px;width:${SCROLLBAR_GUTTER}px;background:${VERTICAL_TRACK_BG};border-radius:${SCROLLBAR_RADIUS}px;z-index:2;opacity:0;transition:opacity 150ms ease;`,
  thumbStyle: `position:absolute;left:0;top:0;background:${SCROLLBAR_THUMB_COLOR};border-radius:${SCROLLBAR_RADIUS}px;min-height:${SCROLLBAR_MIN_THUMB}px;cursor:grab;touch-action:none;`,
};

const HORIZONTAL_TRACK_BG = `linear-gradient(to bottom,${SCROLLBAR_TRACK_COLOR} ${SCROLLBAR_THICKNESS}px,transparent ${SCROLLBAR_THICKNESS}px)`;

const HORIZONTAL_CONFIG: OrientationConfig = {
  scrollPos: (el) => el.scrollLeft,
  setScrollPos: (el, pos) => {
    el.scrollLeft = pos;
  },
  scrollSize: (el) => el.scrollWidth,
  clientSize: (el) => el.clientWidth,
  trackSize: (el) => el.clientWidth,
  pointerPos: (event) => event.clientX,
  trackPointerOffset: (trackRect, event) => event.clientX - trackRect.left,
  thumbTransform: (pos) => `translateX(${pos}px)`,
  thumbSizeStyle: (size) => ({ width: `${size}px`, height: `${SCROLLBAR_THICKNESS}px` }),
  hiddenThumbSize: { width: '0px', height: `${SCROLLBAR_THICKNESS}px` },
  fadeStartStyle: (bgVar) =>
    `position:absolute;top:0;left:0;bottom:0;width:32px;background:linear-gradient(to right,hsl(var(--${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;contain:paint;`,
  fadeEndStyle: (bgVar) =>
    `position:absolute;top:0;right:0;bottom:0;width:32px;background:linear-gradient(to left,hsl(var(--${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;contain:paint;`,
  trackStyle: `position:relative;flex-shrink:0;margin:0 ${SCROLLBAR_TRACK_INSET}px;height:0;background:${HORIZONTAL_TRACK_BG};border-radius:${SCROLLBAR_RADIUS}px;z-index:2;contain:paint;opacity:0;transition:opacity 150ms ease,height 150ms ease;overflow:hidden;`,
  thumbStyle: `position:absolute;left:0;top:0;background:${SCROLLBAR_THUMB_COLOR};border-radius:${SCROLLBAR_RADIUS}px;min-width:${SCROLLBAR_MIN_THUMB}px;cursor:grab;touch-action:none;`,
};

function getConfig(orientation: Orientation): OrientationConfig {
  return orientation === 'horizontal' ? HORIZONTAL_CONFIG : VERTICAL_CONFIG;
}

function isScrollableSize(scrollSize: number, clientSize: number): boolean {
  return scrollSize > clientSize + 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type ScrollMetrics = {
  scrollable: boolean;
  scrollPos: number;
  scrollableDistance: number;
  trackSize: number;
  thumbSize: number;
  trackScrollableDistance: number;
};

function getScrollMetrics(
  container: HTMLElement,
  track: HTMLElement,
  config: OrientationConfig,
): ScrollMetrics {
  const scrollPos = config.scrollPos(container);
  const scrollSize = config.scrollSize(container);
  const clientSize = config.clientSize(container);
  const scrollable = isScrollableSize(scrollSize, clientSize);
  const scrollableDistance = Math.max(0, scrollSize - clientSize);
  const trackSize = config.trackSize(track);
  const thumbSize = scrollable
    ? Math.max(SCROLLBAR_MIN_THUMB, (clientSize / scrollSize) * trackSize)
    : 0;
  const trackScrollableDistance = Math.max(0, trackSize - thumbSize);

  return {
    scrollable,
    scrollPos,
    scrollableDistance,
    trackSize,
    thumbSize,
    trackScrollableDistance,
  };
}

function scrollPosFromThumbPos(
  thumbPos: number,
  metrics: ScrollMetrics,
): number {
  if (!metrics.scrollable || metrics.trackScrollableDistance <= 0) return 0;
  const ratio = thumbPos / metrics.trackScrollableDistance;
  return ratio * metrics.scrollableDistance;
}

function applyContentGutter(
  content: HTMLElement | null | undefined,
  showScrollbar: boolean,
  orientation: Orientation,
  scrollable: boolean,
): void {
  if (!content) return;

  let paddingRight = 0;
  let paddingBottom = 0;

  if (showScrollbar && scrollable && orientation === 'vertical') {
    paddingRight = SCROLLBAR_GUTTER;
  }

  if (content.style.paddingRight !== `${paddingRight}px`) {
    content.style.paddingRight = `${paddingRight}px`;
  }
  if (content.style.paddingBottom !== `${paddingBottom}px`) {
    content.style.paddingBottom = `${paddingBottom}px`;
  }
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
  contentRef,
  orientation = 'vertical',
  bgVar = 'background',
  showScrollbar = true,
  showEndFade = true,
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
    const scrollable = isScrollableSize(scrollSize, clientSize);

    applyContentGutter(contentRef?.current, showScrollbar, orientation, scrollable);

    // Fades
    const startOpacity = scrollPos <= 1 ? '0' : '1';
    const endOpacity = !showEndFade || scrollPos >= scrollSize - clientSize - 1 ? '0' : '1';
    if (fadeStart.style.opacity !== startOpacity) fadeStart.style.opacity = startOpacity;
    if (fadeEnd.style.opacity !== endOpacity) fadeEnd.style.opacity = endOpacity;

    // Thumb (only when scrollbar is shown)
    const track = trackRef?.current;
    const thumb = thumbRef?.current;
    if (showScrollbar && track && thumb) {
      const trackOpacity = scrollable ? '1' : '0';
      if (track.style.opacity !== trackOpacity) track.style.opacity = trackOpacity;
      const pointerEvents = scrollable ? 'auto' : 'none';
      if (track.style.pointerEvents !== pointerEvents) track.style.pointerEvents = pointerEvents;

      if (orientation === 'horizontal') {
        const trackHeight = scrollable ? `${SCROLLBAR_GUTTER}px` : '0px';
        if (track.style.height !== trackHeight) track.style.height = trackHeight;
      }

      if (!scrollable) {
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
  }, [config, containerRef, contentRef, fadeStartRef, fadeEndRef, trackRef, thumbRef, showScrollbar, showEndFade, orientation]);

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
    const content = contentRef?.current;
    if (content) ro.observe(content);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      container.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, [containerRef, contentRef, updateVisuals, notifyScroll]);

  // Drag thumb + click track to scroll manually.
  useEffect(() => {
    if (!showScrollbar) return;

    const container = containerRef.current;
    const track = trackRef?.current;
    const thumb = thumbRef?.current;
    if (!container || !track || !thumb) return;

    type DragState = {
      pointerId: number;
      startPointer: number;
      startScrollPos: number;
      metrics: ScrollMetrics;
    };

    const dragRef: { current: DragState | null } = { current: null };

    const getMetrics = () => getScrollMetrics(container, track, config);

    const endDrag = (pointerId: number) => {
      if (!dragRef.current || dragRef.current.pointerId !== pointerId) return;
      dragRef.current = null;
      thumb.style.cursor = 'grab';
      document.body.style.removeProperty('user-select');
    };

    const handleTrackPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || event.target !== track) return;

      const metrics = getMetrics();
      if (!metrics.scrollable) return;

      const trackRect = track.getBoundingClientRect();
      const pointerOffset = config.trackPointerOffset(trackRect, event);
      const targetThumbPos = pointerOffset - metrics.thumbSize / 2;
      const scrollPos = scrollPosFromThumbPos(
        clamp(targetThumbPos, 0, metrics.trackScrollableDistance),
        metrics,
      );
      config.setScrollPos(container, scrollPos);
      notifyScroll();
    };

    const handleThumbPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const metrics = getMetrics();
      if (!metrics.scrollable) return;

      event.preventDefault();
      event.stopPropagation();

      dragRef.current = {
        pointerId: event.pointerId,
        startPointer: config.pointerPos(event),
        startScrollPos: metrics.scrollPos,
        metrics,
      };

      thumb.setPointerCapture(event.pointerId);
      thumb.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handleThumbPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      event.preventDefault();

      const delta = config.pointerPos(event) - drag.startPointer;
      const { metrics, startScrollPos } = drag;
      const scrollDelta = metrics.trackScrollableDistance > 0
        ? (delta / metrics.trackScrollableDistance) * metrics.scrollableDistance
        : 0;

      config.setScrollPos(
        container,
        clamp(startScrollPos + scrollDelta, 0, metrics.scrollableDistance),
      );
      notifyScroll();
    };

    const handleThumbPointerUp = (event: PointerEvent) => {
      if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
      if (thumb.hasPointerCapture(event.pointerId)) {
        thumb.releasePointerCapture(event.pointerId);
      }
      endDrag(event.pointerId);
    };

    track.addEventListener('pointerdown', handleTrackPointerDown);
    thumb.addEventListener('pointerdown', handleThumbPointerDown);
    thumb.addEventListener('pointermove', handleThumbPointerMove);
    thumb.addEventListener('pointerup', handleThumbPointerUp);
    thumb.addEventListener('pointercancel', handleThumbPointerUp);

    return () => {
      track.removeEventListener('pointerdown', handleTrackPointerDown);
      thumb.removeEventListener('pointerdown', handleThumbPointerDown);
      thumb.removeEventListener('pointermove', handleThumbPointerMove);
      thumb.removeEventListener('pointerup', handleThumbPointerUp);
      thumb.removeEventListener('pointercancel', handleThumbPointerUp);
      document.body.style.removeProperty('user-select');
    };
  }, [
    config,
    containerRef,
    trackRef,
    thumbRef,
    showScrollbar,
    notifyScroll,
  ]);
}
