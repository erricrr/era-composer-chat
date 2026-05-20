import { Composer, Era, getComposersByEra, getLastName, isComposerInPublicDomain } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComposerImageViewer } from './ComposerImageViewer';
import { useState, useCallback, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, LucideIcon } from 'lucide-react';
import { useScrollAffordance, useScrollAreaAffordance } from '@/hooks/useScrollAffordance';

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


interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer, options?: { source?: string }) => void;
  selectedComposer: Composer | null;
  onStartChat: (composer: Composer) => void;
  isOpen?: boolean;
  shouldScrollToComposer: boolean;
  onScrollComplete: () => void;
}

export function ComposerList({
  era,
  onSelectComposer,
  selectedComposer,
  onStartChat,
  isOpen = false,
  shouldScrollToComposer,
  onScrollComplete
}: ComposerListProps) {
  const allComposers = useMemo(
    () => [...getComposersByEra(era)].sort((a, b) =>
      getLastName(a.name).localeCompare(getLastName(b.name))
    ),
    [era]
  );

  // Refs for the always-mounted composer-list ScrollAreas (mobile + desktop).
  // These two ScrollAreas live inside the component for its full lifetime, so
  // the simpler "ref + querySelector inside an effect" pattern is sufficient.
  const mobileScrollAreaRef = useRef<HTMLDivElement>(null);
  const mobileViewportRef = useRef<HTMLElement | null>(null);
  const desktopScrollAreaRef = useRef<HTMLDivElement>(null);
  const desktopViewportRef = useRef<HTMLElement | null>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  const detailsContentRef = useRef<HTMLDivElement>(null);

  // Bio details ScrollArea is conditionally mounted (only when a composer is
  // selected) so we use the helper which handles mount/unmount discovery and
  // re-initializes the scroll affordance accordingly.
  const detailsAffordance = useScrollAreaAffordance({
    bgVar: 'primary-foreground',
    showScrollbar: false,
  });
  const composerDetailsScrollRef = detailsAffordance.rootRef;
  const detailsViewportRef = detailsAffordance.viewportRef;

  // Aggregated viewport refs used by scroll-position helpers below.
  // The bio details viewport is managed by `detailsAffordance` and is read
  // directly via `detailsViewportRef.current` (no aggregator entry needed).
  const viewportRefs = useRef({
    mobile: null as HTMLElement | null,
    desktop: null as HTMLElement | null,
  });

  // Timeout refs to avoid closure issues
  const timeoutRefs = useRef({
    scrollCheck: null as NodeJS.Timeout | null
  });

  // Initialize viewport refs for the always-mounted composer-list ScrollAreas.
  const initializeViewportRefs = useCallback(() => {
    if (mobileScrollAreaRef.current) {
      const mobileViewport = mobileScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      viewportRefs.current.mobile = mobileViewport as HTMLElement | null;
      mobileViewportRef.current = mobileViewport as HTMLElement | null;
    }

    if (desktopScrollAreaRef.current) {
      const desktopViewport = desktopScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      viewportRefs.current.desktop = desktopViewport as HTMLElement | null;
      desktopViewportRef.current = desktopViewport as HTMLElement | null;
    }

    return viewportRefs.current;
  }, []);

  // Handle composer selection
  const handleComposerSelect = useCallback((composer: Composer) => {
    // Reset the details scroll position before selecting the new composer
    const resetDetailsScroll = () => {
      const detailsViewport = detailsViewportRef.current;
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

  type Orientation = 'vertical' | 'horizontal';
  type ScrollAlign = 'nearest' | 'center';

  const getComposerCardId = useCallback((composerId: string, orientation: Orientation) => {
    return orientation === 'vertical'
      ? `composer-card-${composerId}`
      : `mobile-composer-card-${composerId}`;
  }, []);

  const getViewportForOrientation = useCallback((orientation: Orientation) => {
    return orientation === 'vertical'
      ? viewportRefs.current.desktop
      : viewportRefs.current.mobile;
  }, []);

  const getComposerCardElement = useCallback((composerId: string, orientation: Orientation) => {
    return document.getElementById(getComposerCardId(composerId, orientation));
  }, [getComposerCardId]);

  const getScrollOffset = useCallback((element: HTMLElement, container: HTMLElement, orientation: Orientation, align: ScrollAlign): number => {
    if (element.getClientRects().length === 0 || container.getClientRects().length === 0) {
      return 0;
    }

    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (orientation === 'vertical') {
      if (align === 'center') {
        const elementCenter = elementRect.top + elementRect.height / 2;
        const containerCenter = containerRect.top + containerRect.height / 2;
        return elementCenter - containerCenter;
      }

      if (elementRect.top < containerRect.top) {
        return elementRect.top - containerRect.top;
      }

      if (elementRect.bottom > containerRect.bottom) {
        return elementRect.bottom - containerRect.bottom;
      }

      return 0;
    }

    if (align === 'center') {
      const elementCenter = elementRect.left + elementRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;
      return elementCenter - containerCenter;
    }

    if (elementRect.left < containerRect.left) {
      return elementRect.left - containerRect.left;
    }

    if (elementRect.right > containerRect.right) {
      return elementRect.right - containerRect.right;
    }

    return 0;
  }, []);

  const scrollCardToVisibility = useCallback((
    composerId: string,
    orientation: Orientation,
    options: { behavior: ScrollBehavior; align: ScrollAlign },
  ): boolean => {
    const container = getViewportForOrientation(orientation);
    const element = getComposerCardElement(composerId, orientation);

    if (!container || !element) return false;

    const scrollOffset = getScrollOffset(element, container, orientation, options.align);
    if (scrollOffset === 0) return false;

    // For 'auto' behavior we set scroll position directly so it lands pre-paint
    // (immune to CSS `scroll-behavior: smooth`). For 'smooth' we let scrollBy animate.
    if (orientation === 'vertical') {
      if (options.behavior === 'smooth') {
        container.scrollBy({ top: scrollOffset, behavior: 'smooth' });
      } else {
        container.scrollTop = container.scrollTop + scrollOffset;
      }
    } else {
      if (options.behavior === 'smooth') {
        container.scrollBy({ left: scrollOffset, behavior: 'smooth' });
      } else {
        container.scrollLeft = container.scrollLeft + scrollOffset;
      }
    }

    return true;
  }, [getComposerCardElement, getScrollOffset, getViewportForOrientation]);

  const ensureComposerVisibility = useCallback((
    composerId: string | undefined,
    options: { behavior: ScrollBehavior; align: ScrollAlign },
  ) => {
    if (!composerId) return false;
    if (!allComposers.some((composer) => composer.id === composerId)) return false;

    const scrolledDesktop = scrollCardToVisibility(composerId, 'vertical', options);
    const scrolledMobile = scrollCardToVisibility(composerId, 'horizontal', options);
    return scrolledDesktop || scrolledMobile;
  }, [allComposers, scrollCardToVisibility]);

  // Handle composer card click
  const handleComposerCardClick = useCallback((composer: Composer, element: HTMLElement | null) => {
    if (!element) {
      handleComposerSelect(composer);
      return;
    }

    let scrolled = false;
    const orientation: Orientation = element.id.startsWith('mobile-composer-card-')
      ? 'horizontal'
      : 'vertical';
    scrolled = scrollCardToVisibility(composer.id, orientation, { behavior: 'smooth', align: 'nearest' });

    handleComposerSelect(composer);

    if (scrolled) {
      if (timeoutRefs.current.scrollCheck) {
        clearTimeout(timeoutRefs.current.scrollCheck);
      }
      timeoutRefs.current.scrollCheck = setTimeout(onScrollComplete, 300);
    }
  }, [handleComposerSelect, onScrollComplete, scrollCardToVisibility]);

  // Initialize viewport refs for the always-mounted composer-list ScrollAreas
  // when the era changes (which can reflow content). The conditionally-mounted
  // bio details ScrollArea manages its own viewport via `detailsAffordance`.
  useEffect(() => {
    initializeViewportRefs();
  }, [era, initializeViewportRefs]);

  // Apply scroll affordance to desktop viewport
  useScrollAffordance(desktopViewportRef, {
    itemCount: allComposers.length,
    noun: 'composers',
    bgVar: 'background'
  });

  // Apply scroll affordance to mobile horizontal viewport
  useScrollAffordance(mobileViewportRef, {
    itemCount: allComposers.length,
    noun: 'composers',
    bgVar: 'background',
    orientation: 'horizontal'
  });

  // Reset details scroll position when selected composer changes
  useEffect(() => {
    if (!selectedComposer) return;

    // Check if we're on Safari
    const isSafariBrowser = isSafari();

    // Use multiple approaches for cross-browser compatibility
    const resetScroll = () => {
      // 1. Try using the viewport ref from Radix UI ScrollArea
      const detailsViewport = detailsViewportRef.current;
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

  // Scroll to selected composer when requested (search flow: animated, centered)
  useEffect(() => {
    if (!selectedComposer || !shouldScrollToComposer) return;

    const scrollToComposer = () => {
      const scrolled = ensureComposerVisibility(selectedComposer.id, {
        behavior: 'smooth',
        align: 'center',
      });

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
  }, [selectedComposer, shouldScrollToComposer, onScrollComplete, era, ensureComposerVisibility]);

  // Keep selected composer in view pre-paint for the active era.
  // Runs synchronously after DOM mutations and before browser paint, so the
  // user never sees an intermediate scroll position when switching eras.
  useLayoutEffect(() => {
    initializeViewportRefs();
    ensureComposerVisibility(selectedComposer?.id, { behavior: 'auto', align: 'nearest' });
  }, [era, selectedComposer?.id, ensureComposerVisibility, initializeViewportRefs]);

  // Handle selected composer visibility on resize
  const keepSelectedComposerVisibleOnResize = useCallback(() => {
    if (!selectedComposer) return;

    // Delay to allow layout to settle
    setTimeout(() => {
      ensureComposerVisibility(selectedComposer.id, { behavior: 'auto', align: 'nearest' });
    }, 150);
  }, [selectedComposer, ensureComposerVisibility]);

  // Add resize handler
  useEffect(() => {
    // Debounce resize events
    let resizeTimeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initializeViewportRefs(); // Re-initialize viewport refs on resize
        keepSelectedComposerVisibleOnResize();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [keepSelectedComposerVisibleOnResize, initializeViewportRefs]);

  // Use IntersectionObserver to detect when the content is visible
  useEffect(() => {
    if (!selectedComposer || !detailsContentRef.current) return;

    // This is especially helpful for Safari
    const resetScrollOnVisible = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting) {
        // Content is visible, force reset scroll
        const detailsViewport = detailsViewportRef.current;
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
            <div className="relative">
              {/* Removed the shadow divs that were here */}
              <ScrollArea ref={mobileScrollAreaRef} className="w-full h-auto scroll-area">
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
              </ScrollArea>
            </div>
          </div>
          {/* Desktop vertical scroll */}
          <div className="hidden md:flex flex-col flex-1 overflow-hidden relative py-0">
            <div className="relative overflow-hidden h-full">
              {/* Remove desktop vertical scroll shadows */}
              <ScrollArea ref={desktopScrollAreaRef} className="w-full h-full scroll-area">
                <div className="flex flex-col relative">
                  {allComposers.map((composer, idx) => (
                    <div
                      key={composer.id}
                      id={`composer-card-${composer.id}`}
                      className="w-full"
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
              </ScrollArea>
            </div>
          </div>

          {/* Scroll indicators removed - using scroll affordance instead */}
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
                  <div className="flex flex-col lg:flex-row lg:items-center gap-1 mt-1">
                    <span className="text-base md:text-lg text-muted-foreground">
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
              <ScrollArea ref={detailsAffordance.setRoot} className="w-full h-full">
                <div className="px-4 md:px-5 py-3 space-y-4" ref={detailsContentRef}>
                  <p className="text-base md:text-lg text-foreground/90">
                    {selectedComposer.shortBio}
                  </p>
                  <div>
                    <h4 className="font-semibold mb-2 text-lg md:text-xl">Notable Works</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      {selectedComposer.famousWorks.slice(0, 3).map((work, index) => (
                        <li key={index} className="text-base md:text-lg text-foreground/80">{work}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>
              {/* Scroll shadow for biography section */}
              <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-background to-transparent z-10" />
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
