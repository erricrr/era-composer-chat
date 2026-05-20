import { useEffect, useRef, useCallback } from 'react';

interface ScrollAffordanceOptions {
  itemCount: number;
  noun?: string;
  bgVar?: string;
  orientation?: 'vertical' | 'horizontal';
}

interface ScrollAffordanceElements {
  wrapper: HTMLDivElement;
  fadeStart: HTMLDivElement;
  fadeEnd: HTMLDivElement;
  track: HTMLDivElement;
  thumb: HTMLDivElement;
  countLabel: HTMLDivElement;
}

// Scrollbar appearance (single source of truth for track + thumb colors/sizes).
const SCROLLBAR_THICKNESS = 4;
const SCROLLBAR_THUMB_COLOR = 'hsl(var(--border))';
const SCROLLBAR_TRACK_COLOR = 'hsl(var(--border) / 0.4)';
const SCROLLBAR_RADIUS = 3;
const SCROLLBAR_MIN_THUMB = 24;
// Space reserved inside the scroll viewport so content doesn't sit under the track.
// Must be >= track offset (4px) + track thickness + small visual gap.
const SCROLLBAR_GUTTER = 10;

type OrientationConfig = {
  scrollPos: (el: HTMLElement) => number;
  scrollSize: (el: HTMLElement) => number;
  clientSize: (el: HTMLElement) => number;
  trackSize: (el: HTMLElement) => number;
  thumbTransform: (pos: number) => string;
  thumbSizeStyle: (size: number) => { width: string; height: string };
  hiddenThumbSize: { width: string; height: string };
  overflowStyle: string;
  viewportPaddingStyle: string;
  fadeStyles: { start: string; end: string };
  trackStyle: string;
  thumbStyle: string;
};

function getOrientationConfig(orientation: 'vertical' | 'horizontal', bgVar: string): OrientationConfig {
  const thickness = `${SCROLLBAR_THICKNESS}px`;
  const radius = `${SCROLLBAR_RADIUS}px`;

  if (orientation === 'horizontal') {
    return {
      scrollPos: (el) => el.scrollLeft,
      scrollSize: (el) => el.scrollWidth,
      clientSize: (el) => el.clientWidth,
      trackSize: (el) => el.clientWidth,
      thumbTransform: (pos) => `translateX(${pos}px)`,
      thumbSizeStyle: (size) => ({ width: `${size}px`, height: thickness }),
      hiddenThumbSize: { width: '0px', height: thickness },
      overflowStyle: 'overflow-x: auto !important; overflow-y: hidden !important;',
      // Horizontal cards define their own height, and the track is a thin 4px
      // bar pinned to the very bottom. Adding padding here would create dead
      // space below the card row, so we keep this empty for a tight layout.
      viewportPaddingStyle: '',
      fadeStyles: {
        start: `position:absolute;top:0;left:0;bottom:0;width:32px;background:linear-gradient(to right,hsl(var(${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;contain:paint;`,
        end: `position:absolute;top:0;right:0;bottom:0;width:32px;background:linear-gradient(to left,hsl(var(${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;contain:paint;`,
      },
      trackStyle: `position:absolute;left:4px;right:4px;bottom:0;height:${thickness};background:${SCROLLBAR_TRACK_COLOR};border-radius:${radius};z-index:2;pointer-events:none;contain:paint;`,
      thumbStyle: `position:absolute;background:${SCROLLBAR_THUMB_COLOR};border-radius:${radius};min-width:${SCROLLBAR_MIN_THUMB}px;`,
    };
  }
  return {
    scrollPos: (el) => el.scrollTop,
    scrollSize: (el) => el.scrollHeight,
    clientSize: (el) => el.clientHeight,
    trackSize: (el) => el.clientHeight,
    thumbTransform: (pos) => `translateY(${pos}px)`,
    thumbSizeStyle: (size) => ({ width: thickness, height: `${size}px` }),
    hiddenThumbSize: { width: thickness, height: '0px' },
    overflowStyle: 'overflow-y: auto !important; overflow-x: hidden !important;',
    viewportPaddingStyle: `padding-right: ${SCROLLBAR_GUTTER}px;`,
    fadeStyles: {
      start: `position:absolute;top:0;left:0;right:0;height:32px;background:linear-gradient(to bottom,hsl(var(${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;`,
      end: `position:absolute;bottom:0;left:0;right:0;height:32px;background:linear-gradient(to top,hsl(var(${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;`,
    },
    trackStyle: `position:absolute;right:4px;top:4px;bottom:4px;width:${thickness};background:${SCROLLBAR_TRACK_COLOR};border-radius:${radius};z-index:1;pointer-events:none;`,
    thumbStyle: `position:absolute;background:${SCROLLBAR_THUMB_COLOR};border-radius:${radius};min-height:${SCROLLBAR_MIN_THUMB}px;`,
  };
}

export function useScrollAffordance<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  options: ScrollAffordanceOptions
) {
  const elementsRef = useRef<ScrollAffordanceElements | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const trackSizeRef = useRef<number>(0);
  const configRef = useRef<OrientationConfig | null>(null);

  const { itemCount, noun = 'items', bgVar = 'background', orientation = 'vertical' } = options;

  // Stable refs so changes to itemCount/noun don't re-trigger DOM re-parenting,
  // which would reset scrollTop on the wrapped viewport.
  const itemCountRef = useRef(itemCount);
  const nounRef = useRef(noun);
  itemCountRef.current = itemCount;
  nounRef.current = noun;

  // Initialize config once
  if (!configRef.current) {
    configRef.current = getOrientationConfig(orientation, bgVar);
  }
  const config = configRef.current;

  const updateFadeVisibility = useCallback((
    fadeStart: HTMLDivElement,
    fadeEnd: HTMLDivElement,
    scrollPos: number,
    scrollSize: number,
    clientSize: number
  ) => {
    const isAtStart = scrollPos <= 1;
    const isAtEnd = scrollPos >= scrollSize - clientSize - 1;
    const startOpacity = isAtStart ? '0' : '1';
    const endOpacity = isAtEnd ? '0' : '1';
    if (fadeStart.style.opacity !== startOpacity) fadeStart.style.opacity = startOpacity;
    if (fadeEnd.style.opacity !== endOpacity) fadeEnd.style.opacity = endOpacity;
  }, []);

  const updateThumbPosition = useCallback((
    thumb: HTMLDivElement,
    trackSize: number,
    scrollPos: number,
    scrollSize: number,
    clientSize: number
  ) => {
    if (scrollSize <= clientSize) {
      thumb.style.width = config.hiddenThumbSize.width;
      thumb.style.height = config.hiddenThumbSize.height;
      return;
    }
    const thumbSize = Math.max(SCROLLBAR_MIN_THUMB, (clientSize / scrollSize) * trackSize);
    const scrollableDistance = scrollSize - clientSize;
    const trackScrollableDistance = trackSize - thumbSize;
    const thumbPos = scrollPos > 0 && scrollableDistance > 0 ? (scrollPos / scrollableDistance) * trackScrollableDistance : 0;
    const sizeStyle = config.thumbSizeStyle(thumbSize);
    thumb.style.width = sizeStyle.width;
    thumb.style.height = sizeStyle.height;
    thumb.style.transform = config.thumbTransform(thumbPos);
  }, [config]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    const elements = elementsRef.current;
    if (!container || !elements) return;
    const scrollPos = config.scrollPos(container);
    const scrollSize = config.scrollSize(container);
    const clientSize = config.clientSize(container);
    const { fadeStart, fadeEnd, thumb, track } = elements;
    const trackSize = config.trackSize(track);
    if (trackSize !== trackSizeRef.current) trackSizeRef.current = trackSize;
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      updateFadeVisibility(fadeStart, fadeEnd, scrollPos, scrollSize, clientSize);
      updateThumbPosition(thumb, trackSizeRef.current, scrollPos, scrollSize, clientSize);
    });
  }, [containerRef, updateFadeVisibility, updateThumbPosition, config]);

  const createElements = useCallback((container: HTMLElement): ScrollAffordanceElements => {
    // Find or create wrapper
    let wrapper = container.parentElement as HTMLDivElement | null;
    if (!wrapper || !wrapper.classList.contains('scroll-affordance-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'scroll-affordance-wrapper';
      wrapper.style.cssText = 'position:relative;display:flex;flex-direction:column;height:100%;overflow:hidden;';
      const grandparent = container.parentElement;
      if (grandparent) {
        grandparent.insertBefore(wrapper, container);
        wrapper.appendChild(container);
      }
    }
    // Count label
    const countLabel = document.createElement('div');
    countLabel.className = 'scroll-affordance-count';
    countLabel.textContent = `${itemCountRef.current} ${nounRef.current}`;
    countLabel.style.cssText = 'font-size:12px;color:hsl(var(--muted-foreground));text-align:right;padding:2px 8px;flex-shrink:0;';
    wrapper.insertBefore(countLabel, container);
    // Fades container wraps the scroll container
    const fadesContainer = document.createElement('div');
    fadesContainer.style.cssText = 'position:relative;flex:1;overflow:hidden;min-height:0;';
    wrapper.insertBefore(fadesContainer, container);
    fadesContainer.appendChild(container);
    // Container styles
    container.style.cssText = `${container.style.cssText}height:100% !important;${config.overflowStyle}${config.viewportPaddingStyle}scrollbar-width:none;`;
    // Hide webkit scrollbar
    const styleId = `scroll-affordance-styles-${Math.random().toString(36).slice(2, 9)}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `.${container.className.split(' ').join('.')}::-webkit-scrollbar{display:none !important;}`;
      document.head.appendChild(style);
    }
    // Fade overlays
    const fadeStart = document.createElement('div');
    const fadeEnd = document.createElement('div');
    fadeStart.className = 'scroll-fade-start';
    fadeEnd.className = 'scroll-fade-end';
    fadeStart.style.cssText = config.fadeStyles.start;
    fadeEnd.style.cssText = config.fadeStyles.end;
    fadesContainer.appendChild(fadeStart);
    fadesContainer.appendChild(fadeEnd);
    // Track and thumb
    const track = document.createElement('div');
    const thumb = document.createElement('div');
    track.className = 'scroll-affordance-track';
    thumb.className = 'scroll-affordance-thumb';
    track.style.cssText = config.trackStyle;
    thumb.style.cssText = config.thumbStyle;
    track.appendChild(thumb);
    fadesContainer.appendChild(track);
    return { wrapper, fadeStart, fadeEnd, track, thumb, countLabel };
  }, [config]);

  // Keep the count label text in sync without re-running the mount/unmount effect
  useEffect(() => {
    const elements = elementsRef.current;
    if (!elements) return;
    elements.countLabel.textContent = `${itemCount} ${noun}`;
  }, [itemCount, noun]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create elements
    elementsRef.current = createElements(container);

    const { current: elements } = elementsRef;
    if (!elements) return;

    // Initial scroll position check
    handleScroll();

    // Add scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      handleScroll();
    });
    resizeObserverRef.current.observe(container);

    return () => {
      // Cleanup
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      container.removeEventListener('scroll', handleScroll);

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      // Remove elements we created
      if (elementsRef.current) {
        const { wrapper, fadeStart, fadeEnd, track, countLabel } = elementsRef.current;

        // Unwrap container
        const fadesContainer = fadeStart.parentElement;
        const container = fadesContainer?.querySelector('[data-radix-scroll-area-viewport]') ||
                         fadesContainer?.firstElementChild;

        if (container && wrapper.parentElement) {
          wrapper.parentElement.insertBefore(container, wrapper);
          wrapper.remove();
        }

        elementsRef.current = null;
      }
    };
  }, [containerRef, createElements, handleScroll]);

  // Return cleanup function for manual use
  return useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (elementsRef.current) {
      const { wrapper } = elementsRef.current;
      const container = containerRef.current;

      if (container && wrapper.parentElement) {
        wrapper.parentElement.insertBefore(container, wrapper);
        wrapper.remove();
      }

      elementsRef.current = null;
    }
  }, [containerRef]);
}
