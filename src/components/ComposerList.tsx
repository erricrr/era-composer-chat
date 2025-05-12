import { Composer, Era, getComposersByEra, getLastName, isComposerInPublicDomain } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComposerImageViewer } from './ComposerImageViewer';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, LucideIcon } from 'lucide-react';

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

  // Store viewport refs in refs to ensure their stability
  const viewportRefs = useRef({
    mobile: null as HTMLElement | null,
    desktop: null as HTMLElement | null
  });

  // Scroll states
  const [horizontalScroll, setHorizontalScroll] = useState({ isAtStart: true, isAtEnd: false });
  const [verticalScroll, setVerticalScroll] = useState({ isAtTop: true, isAtBottom: false });

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

    return viewportRefs.current;
  }, []);

  // Handle composer selection
  const handleComposerSelect = useCallback((composer: Composer) => {
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

    const handleScroll = () => {
      scheduleCheck();
    };

    if (mobileViewport) {
      mobileViewport.addEventListener('scroll', handleScroll, { passive: true });
    }

    if (desktopViewport) {
      desktopViewport.addEventListener('scroll', handleScroll, { passive: true });
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

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return (
    <div className="w-full mt-7 relative bg-primary-foreground rounded-lg" style={{ height: "65vh" }}>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] h-full">
        <div className="overflow-hidden h-full flex flex-col">
          {/* Mobile horizontal scroll */}
          <div className="md:hidden flex-shrink-0 relative">
            <div className="relative overflow-hidden">
              <ScrollArea ref={mobileScrollAreaRef} key={`${era}-mobile`} className="w-full h-auto scroll-area">
                <div className="inline-flex h-full items-center relative z-[2]">
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
            </div>
          </div>

          {/* Desktop vertical scroll */}
          <div className="hidden md:flex flex-col flex-1 overflow-hidden relative py-0">
            <div className="relative overflow-hidden h-full">
              <ScrollArea ref={desktopScrollAreaRef} key={`${era}-desktop`} className="w-full h-full scroll-area">
                <div className="flex flex-col h-full relative z-[2]">
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
        </div>

        {selectedComposer && (
          <div className="flex flex-col h-full overflow-hidden p-3">
            <div className="relative flex-1 min-h-0 flex flex-col">
              <div className="px-3 md:px-4 pt-1 flex-shrink-0 relative z-20">
                <div className="flex items-start md:items-center space-x-2 md:space-x-6 border-b pt-2 md:pt-0" style={{ paddingBottom: '10px' }}>
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
                        {selectedComposer.era.map((e, idx) => (
                          <Badge key={e + idx} variant="badge" className="text-xs">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex-1 min-h-0">
                <ScrollArea key={selectedComposer.id} className="h-full">
                  <div
                    tabIndex={0}
                    onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
                    role="region"
                    aria-label={`About ${selectedComposer.name}: biography and notable works`}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary p-3 space-y-2 md:space-y-4"
                  >
                    <p className="text-sm md:text-base text-foreground/90">
                      {selectedComposer.shortBio}
                    </p>
                    <div>
                      <h4 className="font-semibold mb-1 md:mb-2 text-base md:text-lg">Notable Works</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedComposer.famousWorks.slice(0, 3).map((work, index) => (
                          <li key={index} className="text-sm md:text-base text-foreground/80">{work}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
                <div className="pointer-events-none absolute bottom-0 left-0 w-full h-5 bg-gradient-to-t from-primary-foreground to-transparent z-10" />
              </div>
            </div>
            <div className="flex-shrink-0 h-14 md:h-16 px-3 md:px-4 py-2 relative z-20">
              <Button
                onClick={() => {
                  if (selectedComposer && isComposerInPublicDomain(selectedComposer)) {
                    onStartChat(selectedComposer);
                  }
                }}
                disabled={!selectedComposer || !isComposerInPublicDomain(selectedComposer)}
                className={`
                  w-full h-full text-sm md:text-base transition-transform duration-300
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
          </div>
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
