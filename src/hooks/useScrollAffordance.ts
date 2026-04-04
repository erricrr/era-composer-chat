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

type OrientationConfig = {
  scrollPos: (el: HTMLElement) => number;
  scrollSize: (el: HTMLElement) => number;
  clientSize: (el: HTMLElement) => number;
  trackSize: (el: HTMLElement) => number;
  thumbTransform: (pos: number) => string;
  thumbSizeStyle: (size: number) => { width: string; height: string };
  hiddenThumbSize: { width: string; height: string };
  paddingStyle: string;
  overflowStyle: string;
  fadeStyles: { start: string; end: string };
  trackStyle: string;
  minSizeAttr: string;
};

function getOrientationConfig(orientation: 'vertical' | 'horizontal', bgVar: string): OrientationConfig {
  if (orientation === 'horizontal') {
    return {
      scrollPos: (el) => el.scrollLeft,
      scrollSize: (el) => el.scrollWidth,
      clientSize: (el) => el.clientWidth,
      trackSize: (el) => el.clientWidth,
      thumbTransform: (pos) => `translateX(${pos}px)`,
      thumbSizeStyle: (size) => ({ width: `${size}px`, height: '3px' }),
      hiddenThumbSize: { width: '0px', height: '3px' },
      paddingStyle: 'padding-bottom: 8px;',
      overflowStyle: 'overflow-x: auto !important; overflow-y: hidden !important;',
      fadeStyles: {
        start: `position:absolute;top:0;left:0;bottom:0;width:32px;background:linear-gradient(to right,hsl(var(${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;contain:paint;`,
        end: `position:absolute;top:0;right:0;bottom:0;width:32px;background:linear-gradient(to left,hsl(var(${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;contain:paint;`,
      },
      trackStyle: 'position:absolute;left:4px;right:4px;bottom:0;height:3px;background:hsl(var(--border));border-radius:3px;z-index:2;pointer-events:none;contain:paint;',
      minSizeAttr: 'min-width:24px;',
    };
  }
  return {
    scrollPos: (el) => el.scrollTop,
    scrollSize: (el) => el.scrollHeight,
    clientSize: (el) => el.clientHeight,
    trackSize: (el) => el.clientHeight,
    thumbTransform: (pos) => `translateY(${pos}px)`,
    thumbSizeStyle: (size) => ({ width: '3px', height: `${size}px` }),
    hiddenThumbSize: { width: '3px', height: '0px' },
    paddingStyle: '',
    overflowStyle: 'overflow-y: auto !important; overflow-x: hidden !important;',
    fadeStyles: {
      start: `position:absolute;top:0;left:0;right:0;height:32px;background:linear-gradient(to bottom,hsl(var(${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;`,
      end: `position:absolute;bottom:0;left:0;right:0;height:32px;background:linear-gradient(to top,hsl(var(${bgVar})),transparent);pointer-events:none;z-index:1;opacity:0;transition:opacity 150ms ease;`,
    },
    trackStyle: 'position:absolute;right:4px;top:4px;bottom:4px;width:3px;background:hsl(var(--border));border-radius:3px;z-index:1;pointer-events:none;',
    minSizeAttr: 'min-height:24px;',
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
    const minThumbSize = 24;
    const thumbSize = Math.max(minThumbSize, (clientSize / scrollSize) * trackSize);
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
    countLabel.textContent = `${itemCount} ${noun}`;
    countLabel.style.cssText = 'font-size:12px;color:hsl(var(--muted-foreground));text-align:right;padding:4px 8px;flex-shrink:0;';
    wrapper.insertBefore(countLabel, container);
    // Fades container wraps the scroll container
    const fadesContainer = document.createElement('div');
    fadesContainer.style.cssText = 'position:relative;flex:1;overflow:hidden;min-height:0;';
    wrapper.insertBefore(fadesContainer, container);
    fadesContainer.appendChild(container);
    // Container styles
    container.style.cssText = `${container.style.cssText}height:100% !important;${config.overflowStyle}scrollbar-width:none;`;
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
    thumb.style.cssText = `position:absolute;background:hsl(var(--primary));border-radius:3px;${config.minSizeAttr}`;
    track.appendChild(thumb);
    fadesContainer.appendChild(track);
    return { wrapper, fadeStart, fadeEnd, track, thumb, countLabel };
  }, [itemCount, noun, config]);

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
