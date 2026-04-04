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

export function useScrollAffordance<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  options: ScrollAffordanceOptions
) {
  const elementsRef = useRef<ScrollAffordanceElements | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const { itemCount, noun = 'items', bgVar = 'background', orientation = 'vertical' } = options;
  const isHorizontal = orientation === 'horizontal';

  const updateFadeVisibility = useCallback((
    fadeStart: HTMLDivElement,
    fadeEnd: HTMLDivElement,
    scrollPos: number,
    scrollSize: number,
    clientSize: number
  ) => {
    const isAtStart = scrollPos <= 1;
    const isAtEnd = scrollPos >= scrollSize - clientSize - 1;

    fadeStart.style.opacity = isAtStart ? '0' : '1';
    fadeEnd.style.opacity = isAtEnd ? '0' : '1';
  }, []);

  const updateThumbPosition = useCallback((
    thumb: HTMLDivElement,
    trackSize: number,
    scrollPos: number,
    scrollSize: number,
    clientSize: number
  ) => {
    if (scrollSize <= clientSize) {
      thumb.style.width = isHorizontal ? '0px' : '3px';
      thumb.style.height = isHorizontal ? '3px' : '0px';
      return;
    }

    const minThumbSize = 24;
    const thumbSize = Math.max(
      minThumbSize,
      (clientSize / scrollSize) * trackSize
    );

    const scrollableDistance = scrollSize - clientSize;
    const trackScrollableDistance = trackSize - thumbSize;
    const thumbPos = scrollPos > 0 && scrollableDistance > 0
      ? (scrollPos / scrollableDistance) * trackScrollableDistance
      : 0;

    if (isHorizontal) {
      thumb.style.width = `${thumbSize}px`;
      thumb.style.height = '3px';
      thumb.style.transform = `translateX(${thumbPos}px)`;
    } else {
      thumb.style.width = '3px';
      thumb.style.height = `${thumbSize}px`;
      thumb.style.transform = `translateY(${thumbPos}px)`;
    }
  }, [isHorizontal]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    const elements = elementsRef.current;
    if (!container || !elements) return;

    const scrollPos = isHorizontal ? container.scrollLeft : container.scrollTop;
    const scrollSize = isHorizontal ? container.scrollWidth : container.scrollHeight;
    const clientSize = isHorizontal ? container.clientWidth : container.clientHeight;
    const { fadeStart, fadeEnd, thumb, track } = elements;

    // Cancel any pending rAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      updateFadeVisibility(fadeStart, fadeEnd, scrollPos, scrollSize, clientSize);
      updateThumbPosition(thumb, isHorizontal ? track.clientWidth : track.clientHeight, scrollPos, scrollSize, clientSize);
    });
  }, [containerRef, updateFadeVisibility, updateThumbPosition, isHorizontal]);

  const createElements = useCallback((container: HTMLElement): ScrollAffordanceElements => {
    // Find or create the parent wrapper
    let wrapper = container.parentElement as HTMLDivElement | null;
    if (!wrapper || !wrapper.classList.contains('scroll-affordance-wrapper')) {
      // Create wrapper and wrap the container
      wrapper = document.createElement('div');
      wrapper.className = 'scroll-affordance-wrapper';
      wrapper.style.cssText = `
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      `;

      const grandparent = container.parentElement;
      if (grandparent) {
        grandparent.insertBefore(wrapper, container);
        wrapper.appendChild(container);
      }
    }

    // Create count label
    const countLabel = document.createElement('div');
    countLabel.className = 'scroll-affordance-count';
    countLabel.textContent = `${itemCount} ${noun}`;
    countLabel.style.cssText = `
      font-size: 12px;
      color: hsl(var(--muted-foreground));
      text-align: right;
      padding: 4px 8px;
      flex-shrink: 0;
    `;
    wrapper.insertBefore(countLabel, container);

    // Create fade overlays container
    const fadesContainer = document.createElement('div');
    fadesContainer.style.cssText = `
      position: relative;
      flex: 1;
      overflow: hidden;
      min-height: 0;
      ${isHorizontal ? 'padding-bottom: 8px;' : ''}
    `;

    // Move container into fades container
    wrapper.insertBefore(fadesContainer, container);
    fadesContainer.appendChild(container);

    // Ensure container fills the fades container
    container.style.cssText = `
      ${container.style.cssText}
      height: 100% !important;
      overflow-y: auto !important;
      scrollbar-width: none;
    `;

    // Add webkit scrollbar hide via style tag (can't be inline)
    const styleId = `scroll-affordance-styles-${Math.random().toString(36).slice(2, 9)}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .${container.className.split(' ').join('.')}::-webkit-scrollbar {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Create fade overlays based on orientation
    const fadeStart = document.createElement('div');
    const fadeEnd = document.createElement('div');

    if (isHorizontal) {
      // Left fade
      fadeStart.className = 'scroll-fade-start';
      fadeStart.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 32px;
        background: linear-gradient(to right, hsl(var(${bgVar})), transparent);
        pointer-events: none;
        z-index: 10;
        opacity: 0;
        transition: opacity 150ms ease;
      `;

      // Right fade
      fadeEnd.className = 'scroll-fade-end';
      fadeEnd.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 32px;
        background: linear-gradient(to left, hsl(var(${bgVar})), transparent);
        pointer-events: none;
        z-index: 10;
        opacity: 0;
        transition: opacity 150ms ease;
      `;
    } else {
      // Top fade
      fadeStart.className = 'scroll-fade-start';
      fadeStart.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 32px;
        background: linear-gradient(to bottom, hsl(var(${bgVar})), transparent);
        pointer-events: none;
        z-index: 10;
        opacity: 0;
        transition: opacity 150ms ease;
      `;

      // Bottom fade
      fadeEnd.className = 'scroll-fade-end';
      fadeEnd.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 32px;
        background: linear-gradient(to top, hsl(var(${bgVar})), transparent);
        pointer-events: none;
        z-index: 10;
        opacity: 0;
        transition: opacity 150ms ease;
      `;
    }

    fadesContainer.appendChild(fadeStart);
    fadesContainer.appendChild(fadeEnd);

    // Create custom scroll track based on orientation
    const track = document.createElement('div');
    track.className = 'scroll-affordance-track';

    if (isHorizontal) {
      track.style.cssText = `
        position: absolute;
        left: 4px;
        right: 4px;
        bottom: 0px;
        height: 3px;
        background: hsl(var(--border));
        border-radius: 3px;
        z-index: 20;
        pointer-events: none;
      `;
    } else {
      track.style.cssText = `
        position: absolute;
        right: 4px;
        top: 4px;
        bottom: 4px;
        width: 3px;
        background: hsl(var(--border));
        border-radius: 3px;
        z-index: 20;
        pointer-events: none;
      `;
    }

    const thumb = document.createElement('div');
    thumb.className = 'scroll-affordance-thumb';
    thumb.style.cssText = `
      position: absolute;
      background: hsl(var(--primary));
      border-radius: 3px;
      ${isHorizontal ? 'height: 3px; min-width: 24px;' : 'width: 3px; min-height: 24px;'}
    `;

    track.appendChild(thumb);
    fadesContainer.appendChild(track);

    return { wrapper, fadeStart, fadeEnd, track, thumb, countLabel };
  }, [itemCount, noun, bgVar, isHorizontal]);

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
