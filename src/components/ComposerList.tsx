import { Composer, Era, getComposersByEra, getLastName, isComposerInPublicDomain } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComposerImageViewer } from './ComposerImageViewer';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, LucideIcon } from 'lucide-react';

// Helper to detect Safari browser
const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('android') === -1;
};

interface ScrollChevronProps {
  direction: 'left' | 'right' | 'up' | 'down';
  onClick?: () => void;
  disabled?: boolean;
}

const ScrollChevron = ({ direction, onClick = () => {}, disabled = false }: ScrollChevronProps) => {
  const ChevronIconMap = {
    left: ChevronLeft,
    right: ChevronRight,
    up: ChevronUp,
    down: ChevronDown,
  };

  const disabledClasses = disabled ? 'pointer-events-none cursor-default' : '';
  const innerBgClass = disabled ? 'bg-background' : 'bg-primary/35 hover:bg-primary/65';

  const Icon = ChevronIconMap[direction];
  const isHorizontal = direction === 'left' || direction === 'right';

  const roundedClass = isHorizontal
    ? (direction === 'left' ? 'rounded-l-md' : 'rounded-r-md')
    : (direction === 'up' ? 'rounded-t-md' : 'rounded-b-md');

  const dimensionAndMarginClass = isHorizontal ? 'w-2.5 h-10 mb-2' : 'w-10 h-2.5';

  const commonInnerDivClasses = `
    ${innerBgClass}
    ${roundedClass}
    flex items-center justify-center
    relative
    transition-colors
    duration-200
    select-none
    cursor-pointer
    ${dimensionAndMarginClass}
  `;

  if (isHorizontal) {
    return (
      <div
        className={`absolute top-0 bottom-0 flex items-center select-none z-20 ${disabledClasses}`}
        style={{ [direction]: 0 }}
        onClick={onClick}
      >
        <div className={commonInnerDivClasses}>
          <Icon size={18} className="text-background absolute" />
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={`
          ${commonInnerDivClasses}
          text-secondary
          ${disabledClasses}
        `}
        onClick={onClick}
      >
        <Icon size={18} className="text-background" />
      </div>
    );
  }
};

interface ScrollIndicatorProps {
  orientation: 'horizontal' | 'vertical';
  isAtStart: boolean;
  isAtEnd: boolean;
}

const ScrollIndicator = ({ orientation, isAtStart, isAtEnd }: ScrollIndicatorProps) => {
  const containerClasses = orientation === 'horizontal'
    ? "flex justify-center mt-2 gap-1"
    : "flex flex-col gap-1 p-1";

  return (
    <div className={containerClasses}>
      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${!isAtStart ? 'bg-primary/70' : 'bg-primary/20'}`} />
      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${!isAtEnd ? 'bg-primary/70' : 'bg-primary/20'}`} />
    </div>
  );
};

interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer, options?: { source?: string }) => void;
  selectedComposer: Composer | null;
  onStartChat: (composer: Composer) => void;
  isOpen?: boolean;
  shouldScrollToComposer: boolean;
  onScrollComplete: () => void;
  getMobileScrollPosition: (era: Era) => number;
  setMobileScrollPosition: (era: Era, pos: number) => void;
  getDesktopScrollPosition: (era: Era) => number;
  setDesktopScrollPosition: (era: Era, pos: number) => void;
}

export function ComposerList({
  era,
  onSelectComposer,
  selectedComposer,
  onStartChat,
  isOpen = false,
  shouldScrollToComposer,
  onScrollComplete,
  getMobileScrollPosition,
  setMobileScrollPosition,
  getDesktopScrollPosition,
  setDesktopScrollPosition
}: ComposerListProps) {
  const allComposers = useMemo(() => getComposersByEra(era), [era]);

  // Refs for scroll containers
  const mobileScrollAreaRef = useRef<HTMLDivElement>(null);
  const desktopScrollAreaRef = useRef<HTMLDivElement>(null);
  const composerDetailsScrollRef = useRef<HTMLDivElement>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  const detailsContentRef = useRef<HTMLDivElement>(null);

  // Store viewport refs in refs to ensure their stability
  const viewportRefs = useRef({
    mobile: null as HTMLElement | null,
    desktop: null as HTMLElement | null,
    details: null as HTMLElement | null
  });

  // Scroll states
  const [horizontalScroll, setHorizontalScroll] = useState({ isAtStart: true, isAtEnd: false });
  const [verticalScroll, setVerticalScroll] = useState({ isAtTop: true, isAtBottom: false });
  const [detailsScroll, setDetailsScroll] = useState({ isAtTop: true, isAtBottom: false });

  // Timeout refs to avoid closure issues
  const timeoutRefs = useRef({
    mobileScroll: null as NodeJS.Timeout | null,
    desktopScroll: null as NodeJS.Timeout | null,
    scrollCheck: null as NodeJS.Timeout | null
  });

  // Initialize viewport refs when scroll areas are mounted
  const initializeViewportRefs = useCallback(() => {
    if (mobileScrollAreaRef.current) {
      viewportRefs.current.mobile = mobileScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    }

    if (desktopScrollAreaRef.current) {
      viewportRefs.current.desktop = desktopScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    }

    if (composerDetailsScrollRef.current) {
      viewportRefs.current.details = composerDetailsScrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
    }

    return viewportRefs.current;
  }, []);

  // Handle composer selection
  const handleComposerSelect = useCallback((composer: Composer) => {
    // Reset the details scroll position before selecting the new composer
    const resetDetailsScroll = () => {
      const detailsViewport = viewportRefs.current.details;
      if (detailsViewport) {
        detailsViewport.scrollTop = 0;
      }

      const scrollAreaElement = composerDetailsScrollRef.current;
      if (scrollAreaElement) {
        const viewport = scrollAreaElement.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport && viewport instanceof HTMLElement) {
          viewport.scrollTop = 0;
        }
      }
    };

    // Reset scroll first
    resetDetailsScroll();

    // Then select the composer
    onSelectComposer(composer, { source: 'list' });
  }, [onSelectComposer]);

  // Check if element is fully visible in container
  const handlePartialVisibility = useCallback((element: HTMLElement, container: HTMLElement, isVertical: boolean): boolean => {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    let scrollOffset = 0;
    let needsScroll = false;

    if (isVertical) {
      if (elementRect.top < containerRect.top) {
        scrollOffset = elementRect.top - containerRect.top;
        needsScroll = true;
      } else if (elementRect.bottom > containerRect.bottom) {
        scrollOffset = elementRect.bottom - containerRect.bottom;
        needsScroll = true;
      }

      if (needsScroll) {
        container.scrollBy({ top: scrollOffset, behavior: 'smooth' });
      }
    } else {
      if (elementRect.left < containerRect.left) {
        scrollOffset = elementRect.left - containerRect.left;
        needsScroll = true;
      } else if (elementRect.right > containerRect.right) {
        scrollOffset = elementRect.right - containerRect.right;
        needsScroll = true;
      }

      if (needsScroll) {
        container.scrollBy({ left: scrollOffset, behavior: 'smooth' });
      }
    }

    return needsScroll;
  }, []);

  // Handle composer card click
  const handleComposerCardClick = useCallback((composer: Composer, element: HTMLElement | null) => {
    if (!element) {
      handleComposerSelect(composer);
      return;
    }

    const viewports = viewportRefs.current;
    let scrolled = false;

    if (viewports.desktop && element.closest('.md\\:flex')) {
      scrolled = handlePartialVisibility(element, viewports.desktop, true);
    }

    if (viewports.mobile && element.closest('.md\\:hidden')) {
      scrolled = handlePartialVisibility(element, viewports.mobile, false);
    }

    handleComposerSelect(composer);

    if (scrolled) {
      if (timeoutRefs.current.scrollCheck) {
        clearTimeout(timeoutRefs.current.scrollCheck);
      }
      timeoutRefs.current.scrollCheck = setTimeout(onScrollComplete, 300);
    }
  }, [handleComposerSelect, handlePartialVisibility, onScrollComplete]);

  // Effect to capture viewport elements
  useEffect(() => {
    initializeViewportRefs();
  }, [era, initializeViewportRefs]);

  // Reset details scroll position when selected composer changes
  useEffect(() => {
    if (!selectedComposer) return;

    // Check if we're on Safari
    const isSafariBrowser = isSafari();

    // Use multiple approaches for cross-browser compatibility
    const resetScroll = () => {
      // 1. Try using the viewport ref from Radix UI ScrollArea
      const detailsViewport = viewportRefs.current.details;
      if (detailsViewport) {
        detailsViewport.scrollTop = 0;
        // Also try the smooth method as a backup
        try {
          detailsViewport.scrollTo({ top: 0, behavior: 'instant' });
        } catch (e) {
          // Some browsers might not support this
        }
      }

      // 2. Try direct DOM access to the ScrollArea component
      const scrollAreaElement = composerDetailsScrollRef.current;
      if (scrollAreaElement) {
        // Try to find the viewport through different selectors for better compatibility
        const viewports = [
          scrollAreaElement.querySelector('[data-radix-scroll-area-viewport]'),
          scrollAreaElement.querySelector('.scroll-area-viewport'),
          scrollAreaElement.querySelector('[role="presentation"]')
        ];

        viewports.forEach(viewport => {
          if (viewport && viewport instanceof HTMLElement) {
            viewport.scrollTop = 0;
            try {
              viewport.scrollTo({ top: 0, behavior: 'instant' });
            } catch (e) {
              // Some browsers might not support this
            }
          }
        });
      }

      // Safari-specific fix: force a reflow by toggling a class
      if (isSafariBrowser && scrollAreaElement) {
        // More aggressive fix for Safari
        scrollAreaElement.style.display = 'none';
        // Force a reflow
        void scrollAreaElement.offsetHeight;
        scrollAreaElement.style.display = '';

        // Also try a class toggle approach
        scrollAreaElement.classList.add('force-reflow');
        setTimeout(() => scrollAreaElement.classList.remove('force-reflow'), 10);
      }

      // 3. Use a setTimeout as a last resort to ensure the scroll is reset
      // after the component has fully rendered
      setTimeout(() => {
        // Try again with the viewport ref
        const delayedViewport = composerDetailsScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (delayedViewport && delayedViewport instanceof HTMLElement) {
          delayedViewport.scrollTop = 0;
        }

        // Announce for screen readers that details have been loaded and scrolled to top
        if (announcerRef.current) {
          announcerRef.current.textContent = `Details for ${selectedComposer.name} loaded and scrolled to the beginning.`;
        }
      }, 50);
    };

    // Call immediately
    resetScroll();

    // And also after a short delay to ensure DOM is ready
    const timer = setTimeout(resetScroll, 100);

    // For Safari, run an additional reset after layout calculations with longer delays
    const safariTimers: NodeJS.Timeout[] = [];
    if (isSafariBrowser) {
      [300, 500, 800].forEach(delay => {
        safariTimers.push(setTimeout(resetScroll, delay));
      });
    }

    return () => {
      clearTimeout(timer);
      safariTimers.forEach(clearTimeout);
    };
  }, [selectedComposer]);

  // Scroll to selected composer when requested
  useEffect(() => {
    if (!selectedComposer || !shouldScrollToComposer) return;

    const scrollToComposer = () => {
      const viewports = viewportRefs.current;
      let scrolled = false;

      // Desktop scroll
      const desktopElement = document.getElementById(`composer-card-${selectedComposer.id}`);
      if (desktopElement && viewports.desktop) {
        const containerRect = viewports.desktop.getBoundingClientRect();
        const elementRect = desktopElement.getBoundingClientRect();
        const elementTop = elementRect.top - containerRect.top;
        const elementBottom = elementRect.bottom - containerRect.top;

        if (elementTop < 0 || elementBottom > containerRect.height) {
          const scrollTarget = elementTop + viewports.desktop.scrollTop - (containerRect.height - elementRect.height) / 2;
          viewports.desktop.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          scrolled = true;
        }
      }

      // Mobile scroll
      const mobileElement = document.getElementById(`mobile-composer-card-${selectedComposer.id}`);
      if (mobileElement && viewports.mobile) {
        const containerRect = viewports.mobile.getBoundingClientRect();
        const elementRect = mobileElement.getBoundingClientRect();
        const elementLeft = elementRect.left - containerRect.left;
        const elementRight = elementRect.right - containerRect.left;

        if (elementLeft < 0 || elementRight > containerRect.width) {
          viewports.mobile.scrollTo({
            left: viewports.mobile.scrollLeft + elementLeft - (containerRect.width - elementRect.width) / 2,
            behavior: 'smooth',
          });
          scrolled = true;
        }
      }

      if (scrolled) {
        if (timeoutRefs.current.scrollCheck) {
          clearTimeout(timeoutRefs.current.scrollCheck);
        }
        timeoutRefs.current.scrollCheck = setTimeout(onScrollComplete, 300);
      } else {
        onScrollComplete();
      }
    };

    const timer = setTimeout(scrollToComposer, 100);
    return () => clearTimeout(timer);
  }, [selectedComposer, shouldScrollToComposer, onScrollComplete, era]);

  // Save scroll positions when scrolling
  useEffect(() => {
    const viewports = viewportRefs.current;

    const handleMobileScroll = () => {
      const container = viewports.mobile;
      if (!container) return;

      if (timeoutRefs.current.mobileScroll) {
        clearTimeout(timeoutRefs.current.mobileScroll);
      }

      timeoutRefs.current.mobileScroll = setTimeout(() => {
        setMobileScrollPosition(era, container.scrollLeft);
      }, 150);
    };

    const handleDesktopScroll = () => {
      const container = viewports.desktop;
      if (!container) return;

      if (timeoutRefs.current.desktopScroll) {
        clearTimeout(timeoutRefs.current.desktopScroll);
      }

      timeoutRefs.current.desktopScroll = setTimeout(() => {
        setDesktopScrollPosition(era, container.scrollTop);
      }, 150);
    };

    if (viewports.mobile) {
      viewports.mobile.addEventListener('scroll', handleMobileScroll, { passive: true });
    }

    if (viewports.desktop) {
      viewports.desktop.addEventListener('scroll', handleDesktopScroll, { passive: true });
    }

    return () => {
      if (viewports.mobile) {
        viewports.mobile.removeEventListener('scroll', handleMobileScroll);
      }

      if (viewports.desktop) {
        viewports.desktop.removeEventListener('scroll', handleDesktopScroll);
      }

      if (timeoutRefs.current.mobileScroll) {
        clearTimeout(timeoutRefs.current.mobileScroll);
      }

      if (timeoutRefs.current.desktopScroll) {
        clearTimeout(timeoutRefs.current.desktopScroll);
      }
    };
  }, [era, setMobileScrollPosition, setDesktopScrollPosition]);

  // Restore scroll positions
  useEffect(() => {
    const restoreScrollPositions = () => {
      const viewports = viewportRefs.current;

      if (viewports.mobile) {
        const pos = getMobileScrollPosition(era);
        viewports.mobile.scrollTo({ left: pos, behavior: 'instant' });
      }

      if (viewports.desktop) {
        const pos = getDesktopScrollPosition(era);
        viewports.desktop.scrollTo({ top: pos, behavior: 'instant' });
      }
    };

    const timer = setTimeout(restoreScrollPositions, 50);
    return () => clearTimeout(timer);
  }, [era, getMobileScrollPosition, getDesktopScrollPosition]);

  // Check scroll positions to show/hide indicators
  useEffect(() => {
    const checkScrollPositions = () => {
      // Check horizontal scroll
      const mobileViewport = mobileScrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (mobileViewport) {
        const { scrollLeft, scrollWidth, clientWidth } = mobileViewport;
        const buffer = 2;
        setHorizontalScroll({
          isAtStart: scrollLeft <= buffer,
          isAtEnd: Math.abs(scrollWidth - (scrollLeft + clientWidth)) <= buffer
        });
      }

      // Check vertical scroll
      const desktopViewport = desktopScrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (desktopViewport) {
        const { scrollTop, scrollHeight, clientHeight } = desktopViewport;
        const buffer = 2;
        setVerticalScroll({
          isAtTop: scrollTop <= buffer,
          isAtBottom: Math.abs(scrollHeight - (scrollTop + clientHeight)) <= buffer
        });
      }

      // Check details scroll
      const detailsViewport = composerDetailsScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (detailsViewport) {
        const { scrollTop, scrollHeight, clientHeight } = detailsViewport;
        const buffer = 2;
        setDetailsScroll({
          isAtTop: scrollTop <= buffer,
          isAtBottom: Math.abs(scrollHeight - (scrollTop + clientHeight)) <= buffer
        });
      }
    };

    // Use requestAnimationFrame for smoother performance
    let rafId: number | null = null;
    const scheduleCheck = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkScrollPositions);
    };

    // Initial check after brief delay to ensure content is rendered
    const initialTimer = setTimeout(scheduleCheck, 100);

    // Set up event listeners
    const mobileViewport = mobileScrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    const desktopViewport = desktopScrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    const detailsViewport = composerDetailsScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');

    const handleScroll = () => {
      scheduleCheck();
    };

    if (mobileViewport) {
      mobileViewport.addEventListener('scroll', handleScroll, { passive: true });
    }

    if (desktopViewport) {
      desktopViewport.addEventListener('scroll', handleScroll, { passive: true });
    }

    if (detailsViewport) {
      detailsViewport.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Handle resize events
    window.addEventListener('resize', scheduleCheck);

    // Run initial check
    checkScrollPositions();

    return () => {
      clearTimeout(initialTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);

      if (mobileViewport) {
        mobileViewport.removeEventListener('scroll', handleScroll);
      }
      if (desktopViewport) {
        desktopViewport.removeEventListener('scroll', handleScroll);
      }
      if (detailsViewport) {
        detailsViewport.removeEventListener('scroll', handleScroll);
      }

      window.removeEventListener('resize', scheduleCheck);
    };
  }, [era]);

  // Handle selected composer visibility on resize
  const scrollToSelectedComposerOnResize = useCallback(() => {
    if (!selectedComposer) return;

    const viewports = viewportRefs.current;

    const checkVisibilityAndScroll = () => {
      // Desktop scroll check
      const desktopEl = document.getElementById(`composer-card-${selectedComposer.id}`);
      if (desktopEl && viewports.desktop) {
        const viewportRect = viewports.desktop.getBoundingClientRect();
        const cardRect = desktopEl.getBoundingClientRect();

        const isVisible = cardRect.top >= viewportRect.top && cardRect.bottom <= viewportRect.bottom;
        if (!isVisible) {
          desktopEl.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }

      // Mobile scroll check
      const mobileEl = document.getElementById(`mobile-composer-card-${selectedComposer.id}`);
      if (mobileEl && viewports.mobile) {
        const viewportRect = viewports.mobile.getBoundingClientRect();
        const cardRect = mobileEl.getBoundingClientRect();

        const isVisible = cardRect.left >= viewportRect.left && cardRect.right <= viewportRect.right;
        if (!isVisible) {
          mobileEl.scrollIntoView({ behavior: 'auto', inline: 'center' });
        }
      }
    };

    // Delay to allow layout to settle
    setTimeout(checkVisibilityAndScroll, 150);
  }, [selectedComposer]);

  // Add resize handler
  useEffect(() => {
    // Debounce resize events
    let resizeTimeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initializeViewportRefs(); // Re-initialize viewport refs on resize
        scrollToSelectedComposerOnResize();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [scrollToSelectedComposerOnResize, initializeViewportRefs]);

  // Use IntersectionObserver to detect when the content is visible
  useEffect(() => {
    if (!selectedComposer || !detailsContentRef.current) return;

    // This is especially helpful for Safari
    const resetScrollOnVisible = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting) {
        // Content is visible, force reset scroll
        const detailsViewport = viewportRefs.current.details;
        if (detailsViewport) {
          detailsViewport.scrollTop = 0;
        }

        // Also try direct query
        const scrollAreaElement = composerDetailsScrollRef.current;
        if (scrollAreaElement) {
          const viewport = scrollAreaElement.querySelector('[data-radix-scroll-area-viewport]');
          if (viewport && viewport instanceof HTMLElement) {
            viewport.scrollTop = 0;
          }
        }
      }
    };

    const observer = new IntersectionObserver(resetScrollOnVisible, {
      root: null,
      threshold: 0.1 // Trigger when at least 10% is visible
    });

    observer.observe(detailsContentRef.current);

    return () => {
      observer.disconnect();
    };
  }, [selectedComposer]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return (
    <div className="w-full mt-5 relative bg-primary-foreground rounded-lg"
         style={{
           height: "60svh",
           maxHeight: "calc(100svh - 180px - env(safe-area-inset-bottom, 0px))",
           minHeight: "400px" // Ensure minimum height to prevent collapse on very small viewports
         }}>
      <div
        ref={announcerRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>
     <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] h-full">
        <nav className="overflow-hidden h-full flex flex-col relative" aria-label="Composer navigation">
          {/* Mobile horizontal scroll */}
          <div className="md:hidden flex-shrink-0 relative">
            <div className="relative overflow-hidden">
              {/* Removed the shadow divs that were here */}
              <ScrollArea ref={mobileScrollAreaRef} key={`${era}-mobile`} className="w-full h-auto scroll-area">
                <div className="inline-flex h-full items-center relative">
                  {allComposers.map((composer, idx) => (
                    <div
                      key={composer.id}
                      id={`mobile-composer-card-${composer.id}`}
                      className="flex-shrink-0 w-56 h-full"
                    >
                      <ComposerCard
                        composer={composer}
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                          const card = (e.currentTarget as HTMLElement).closest('[id^="mobile-composer-card-"]');
                          handleComposerCardClick(composer, card as HTMLElement);
                        }}
                        isSelected={selectedComposer?.id === composer.id}
                        tabIndex={0}
                        role="button"
                        ariaLabel={`Select composer ${composer.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const card = (e.currentTarget as HTMLElement).closest('[id^="mobile-composer-card-"]');
                            handleComposerCardClick(composer, card as HTMLElement);
                          } else if (e.key === 'ArrowRight') {
                            const next = document.getElementById(`mobile-composer-card-${allComposers[idx + 1]?.id}`);
                            if (next) (next.querySelector('[tabindex="0"]') as HTMLElement | null)?.focus();
                          } else if (e.key === 'ArrowLeft') {
                            const prev = document.getElementById(`mobile-composer-card-${allComposers[idx - 1]?.id}`);
                            if (prev) (prev.querySelector('[tabindex="0"]') as HTMLElement | null)?.focus();
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <ScrollIndicator
                orientation="horizontal"
                isAtStart={horizontalScroll.isAtStart}
                isAtEnd={horizontalScroll.isAtEnd}
              />
            </div>
          </div>
          {/* Desktop vertical scroll */}
          <div className="hidden md:flex flex-col flex-1 overflow-hidden relative py-0">
            <div className="relative overflow-hidden h-full">
              {/* Remove desktop vertical scroll shadows */}
              <ScrollArea ref={desktopScrollAreaRef} key={`${era}-desktop`} className="w-full h-full scroll-area">
                <div className="flex flex-col h-full relative">
                  {allComposers.map((composer, idx) => (
                    <div
                      key={composer.id}
                      id={`composer-card-${composer.id}`}
                      className="flex-shrink-0"
                    >
                      <ComposerCard
                        composer={composer}
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                          const card = (e.currentTarget as HTMLElement).closest('[id^="composer-card-"]');
                          handleComposerCardClick(composer, card as HTMLElement);
                        }}
                        isSelected={selectedComposer?.id === composer.id}
                        tabIndex={0}
                        role="button"
                        ariaLabel={`Select composer ${composer.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const card = (e.currentTarget as HTMLElement).closest('[id^="composer-card-"]');
                            handleComposerCardClick(composer, card as HTMLElement);
                          } else if (e.key === 'ArrowDown') {
                            const next = document.getElementById(`composer-card-${allComposers[idx + 1]?.id}`);
                            if (next) (next.querySelector('[tabindex="0"]') as HTMLElement | null)?.focus();
                          } else if (e.key === 'ArrowUp') {
                            const prev = document.getElementById(`composer-card-${allComposers[idx - 1]?.id}`);
                            if (prev) (prev.querySelector('[tabindex="0"]') as HTMLElement | null)?.focus();
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" className="select-none" />
              </ScrollArea>
            </div>
          </div>

          {/* Vertical scroll indicators in the gap between columns */}
          <div className="hidden md:block absolute right-[-4px] top-1/2 -translate-y-1/2 z-50">
            <ScrollIndicator
              orientation="vertical"
              isAtStart={verticalScroll.isAtTop}
              isAtEnd={verticalScroll.isAtBottom}
            />
          </div>
        </nav>

        {selectedComposer && (
          <main className="flex flex-col h-full overflow-hidden p-2 md:p-3" aria-label="Composer details">
            {/* Fixed header containing composer details */}
            <div className="flex-shrink-0 px-2 md:px-3 pt-1 pb-1 relative z-20 bg-primary-foreground">
              <div className="flex items-start md:items-center space-x-2 md:space-x-4 pt-0 md:pt-0 pb-2">
                <ComposerImageViewer
                  composer={selectedComposer}
                  size="xxl"
                  allowModalOnDesktop={true}
                  className="focus-visible:z-10 relative"
                />
                <div
                  tabIndex={0}
                  role="region"
                  aria-label={`Composer details: ${selectedComposer.name}, ${selectedComposer.nationality}, ${selectedComposer.birthYear}-${selectedComposer.deathYear || 'present'}`}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-1 min-w-0"
                >
                  <h2 className="sr-only">Composer Details</h2>
                  <h3 className="text-xl md:text-2xl font-bold font-serif break-words">
                    {selectedComposer.name}
                  </h3>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 mt-1">
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {selectedComposer.nationality}, {selectedComposer.birthYear}–{selectedComposer.deathYear || 'present'}
                    </span>
                    <div className="flex flex-wrap gap-1 lg:ml-2">
                      {(Array.isArray(selectedComposer.era)
                        ? selectedComposer.era
                        : [selectedComposer.era]
                      ).map((e, idx) => (
                        <Badge key={e + idx} variant="badge" className="text-xs">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable content area - only bio and works */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
              {/* Only show bottom shadow when needed */}
              {!detailsScroll.isAtBottom && (
                <div className="absolute bottom-0 left-0 right-0 h-8 z-10 pointer-events-none bg-gradient-to-t from-primary-foreground to-transparent" />
              )}
              <ScrollArea ref={composerDetailsScrollRef} className="w-full h-full">
                <div className="px-4 md:px-5 py-3 space-y-4" ref={detailsContentRef}>
                  <p className="text-sm md:text-base text-foreground/90">
                    {selectedComposer.shortBio}
                  </p>
                  <div>
                    <h4 className="font-semibold mb-2 text-base md:text-lg">Notable Works</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      {selectedComposer.famousWorks.slice(0, 3).map((work, index) => (
                        <li key={index} className="text-sm md:text-base text-foreground/80">{work}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>

            {/* Fixed bottom button area */}
            <div
              className="flex-shrink-0 px-2 md:px-3 py-2 md:py-3 sticky bottom-0 left-0 right-0 bg-primary-foreground border-t"
              style={{
                paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
                minHeight: "60px",
                zIndex: 30
              }}
            >
              <Button
                onClick={() => {
                  if (selectedComposer && isComposerInPublicDomain(selectedComposer)) {
                    onStartChat(selectedComposer);
                  }
                }}
                disabled={!selectedComposer || !isComposerInPublicDomain(selectedComposer)}
                className={`
                  w-full h-10 md:h-full text-sm md:text-base transition-transform duration-300
                  ${selectedComposer && isComposerInPublicDomain(selectedComposer)
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]'
                    : 'bg-muted text-muted-foreground opacity-70 cursor-not-allowed'
                  }
                `}
                title={selectedComposer && isComposerInPublicDomain(selectedComposer) ? `Chat with ${getLastName(selectedComposer.name)}` : 'Chat unavailable due to rights restrictions'}
              >
                {selectedComposer && isComposerInPublicDomain(selectedComposer)
                  ? `Start a Chat with ${getLastName(selectedComposer.name)}`
                  : 'Chat unavailable due to rights restrictions'}
              </Button>
            </div>
          </main>
        )}

        {!selectedComposer && (
          <div className="md:flex items-center justify-center h-full text-muted-foreground p-4 text-center">
            Select a composer from the list to see their details and chat availability.
          </div>
        )}
      </div>
    </div>
  );
}
