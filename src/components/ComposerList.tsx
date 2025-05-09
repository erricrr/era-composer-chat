import { Composer, Era, getComposersByEra, getLastName, isComposerInPublicDomain } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComposerImageViewer } from './ComposerImageViewer';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, LucideIcon } from 'lucide-react';

interface ScrollChevronProps {
  direction: 'left' | 'right' | 'up' | 'down';
  onClick: () => void;
}

const ScrollChevron = ({ direction, onClick }: ScrollChevronProps) => {
  const ChevronIcon: Record<typeof direction, LucideIcon> = {
    left: ChevronLeft,
    right: ChevronRight,
    up: ChevronUp,
    down: ChevronDown
  };

  const Icon = ChevronIcon[direction];

  const roundedClasses: Record<typeof direction, string> = {
    left: 'rounded-l-md',
    right: 'rounded-r-md',
    up: 'rounded-t-md',
    down: 'rounded-b-md'
  };

  const containerClasses: Record<typeof direction, string> = {
    left: 'w-2.5 h-10 mb-2',
    right: 'w-2.5 h-10 mb-2',
    up: 'w-10 h-2.5',
    down: 'w-10 h-2.5'
  };

  return (
    <>
      {(direction === 'left' || direction === 'right') ? (
        <div
          className="absolute top-0 bottom-0 flex items-center cursor-pointer select-none z-20"
          style={{ [direction]: 0 }}
          onClick={onClick}
        >
          <div className={`
            ${containerClasses[direction]}
            bg-primary/35 hover:bg-primary/65
            ${roundedClasses[direction]}
            flex items-center justify-center
            relative
            transition-colors
            duration-200
          `}>
            <Icon size={18} className="text-background absolute" />
          </div>
        </div>
      ) : (
        <div
          className={`
            bg-primary/35 hover:bg-primary/65
            text-secondary
            transition-colors
            duration-200
            select-none
            flex items-center justify-center
            cursor-pointer
            ${containerClasses[direction]}
            ${roundedClasses[direction]}
          `}
          onClick={onClick}
        >
          <Icon size={18} className="text-background" />
        </div>
      )}
    </>
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
  console.log("[List] Rendering for era:", era, "Selected:", selectedComposer?.name, "ShouldScroll:", shouldScrollToComposer);
  const allComposers = getComposersByEra(era);

  // State for scroll position indicators
  const [horizontalScroll, setHorizontalScroll] = useState({
    isAtStart: true,
    isAtEnd: false
  });
  const [verticalScroll, setVerticalScroll] = useState({
    isAtTop: true,
    isAtBottom: false
  });

  // Simple selection handler
  const handleComposerSelect = useCallback((composer: Composer) => {
    console.log("[List] handleComposerSelect called for:", composer.name);
    onSelectComposer(composer, { source: 'list' });
  }, [onSelectComposer]);

  // Enhanced effect to scroll selected composer into view
  useEffect(() => {
    if (!selectedComposer || !shouldScrollToComposer) return;

    const scrollToComposer = () => {
      let scrolled = false;

      // Desktop scroll logic
      const desktopElement = document.getElementById(`composer-card-${selectedComposer.id}`);
      const scrollContainer = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement;

      if (desktopElement && scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = desktopElement.getBoundingClientRect();

        // Calculate if element is in view
        const elementTop = elementRect.top - containerRect.top;
        const elementBottom = elementRect.bottom - containerRect.top;

        if (elementTop < 0 || elementBottom > containerRect.height) {
          // Calculate position to scroll to (centering the element)
          const scrollTarget = elementTop + scrollContainer.scrollTop - (containerRect.height - elementRect.height) / 2;

          scrollContainer.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
          });
          scrolled = true;
        }
      }

      // Mobile scroll logic
      const mobileElement = document.getElementById(`mobile-composer-card-${selectedComposer.id}`);
      const mobileContainer = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement;

      if (mobileElement && mobileContainer) {
        const containerRect = mobileContainer.getBoundingClientRect();
        const elementRect = mobileElement.getBoundingClientRect();

        // Calculate if element is in view
        const elementLeft = elementRect.left - containerRect.left;
        const elementRight = elementRect.right - containerRect.left;

        if (elementLeft < 0 || elementRight > containerRect.width) {
          mobileContainer.scrollTo({
            left: mobileContainer.scrollLeft + elementLeft - (containerRect.width - elementRect.width) / 2,
            behavior: 'smooth'
          });
          scrolled = true;
        }
      }

      if (scrolled) {
        setTimeout(onScrollComplete, 300);
      } else {
        onScrollComplete();
      }
    };

    const timer = setTimeout(scrollToComposer, 100);
    return () => clearTimeout(timer);
  }, [selectedComposer, shouldScrollToComposer, onScrollComplete]);

  // Save scroll position on scroll
  useEffect(() => {
    const mobileContainer = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement;
    const desktopContainer = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement;

    let saveTimeout: NodeJS.Timeout;

    const handleScroll = (event: Event) => {
      const container = event.target as HTMLElement;
      clearTimeout(saveTimeout);

      saveTimeout = setTimeout(() => {
        if (container.matches('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]')) {
          setMobileScrollPosition(era, container.scrollLeft);
        } else if (container.matches('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]')) {
          setDesktopScrollPosition(era, container.scrollTop);
        }
      }, 150);
    };

    if (mobileContainer) {
      mobileContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    if (desktopContainer) {
      desktopContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (mobileContainer) {
        mobileContainer.removeEventListener('scroll', handleScroll);
      }
      if (desktopContainer) {
        desktopContainer.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(saveTimeout);
    };
  }, [era, setMobileScrollPosition, setDesktopScrollPosition]);

  // Restore scroll position on era change
  useEffect(() => {
    const restoreScrollPositions = () => {
      const mobileContainer = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement;
      const desktopContainer = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement;

      if (mobileContainer) {
        const pos = getMobileScrollPosition(era);
        mobileContainer.scrollTo({ left: pos, behavior: 'instant' });
      }

      if (desktopContainer) {
        const pos = getDesktopScrollPosition(era);
        desktopContainer.scrollTo({ top: pos, behavior: 'instant' });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(restoreScrollPositions, 50);
    return () => clearTimeout(timer);
  }, [era, getMobileScrollPosition, getDesktopScrollPosition]);

  // Check scroll position when content changes
  useEffect(() => {
    const checkHorizontalScroll = () => {
      const scrollContainer = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement;
      if (!scrollContainer) return;

      const scrollLeft = scrollContainer.scrollLeft;
      const scrollWidth = scrollContainer.scrollWidth;
      const clientWidth = scrollContainer.clientWidth;

      // Add a small buffer for accurate detection
      const buffer = 2;

      setHorizontalScroll({
        isAtStart: scrollLeft <= buffer,
        isAtEnd: scrollWidth - (scrollLeft + clientWidth) <= buffer
      });
    };

    const checkVerticalScroll = () => {
      const scrollContainer = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement;
      if (!scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;

      // Add a small buffer for accurate detection
      const buffer = 2;

      setVerticalScroll({
        isAtTop: scrollTop <= buffer,
        isAtBottom: scrollHeight - (scrollTop + clientHeight) <= buffer
      });
    };

    // Initial check
    const initialCheck = () => {
      requestAnimationFrame(() => {
        checkHorizontalScroll();
        checkVerticalScroll();
      });
    };

    // Run initial check after a short delay to ensure content is rendered
    const initialTimer = setTimeout(initialCheck, 100);

    // Add scroll event listeners with debouncing
    let scrollTimeout: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        checkHorizontalScroll();
        checkVerticalScroll();
      }, 50);
    };

    const horizontalContainer = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]');
    const verticalContainer = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]');

    if (horizontalContainer) {
      horizontalContainer.addEventListener('scroll', debouncedCheck, { passive: true });
    }
    if (verticalContainer) {
      verticalContainer.addEventListener('scroll', debouncedCheck, { passive: true });
    }

    // Add resize listener
    window.addEventListener('resize', initialCheck);

    // Add mutation observer to detect content changes
    const observer = new MutationObserver(initialCheck);
    const scrollAreas = document.querySelectorAll('.scroll-area');
    scrollAreas.forEach(area => {
      observer.observe(area, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    });

    // Run check when era changes
    initialCheck();

    // Cleanup
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(scrollTimeout);
      window.removeEventListener('resize', initialCheck);
      if (horizontalContainer) {
        horizontalContainer.removeEventListener('scroll', debouncedCheck);
      }
      if (verticalContainer) {
        verticalContainer.removeEventListener('scroll', debouncedCheck);
      }
      observer.disconnect();
    };
  }, [era]); // Re-run when era changes to ensure proper tracking

  // Enhanced handling for maintaining selected composer in view during window resize
  const scrollToSelectedComposer = useCallback(() => {
    if (selectedComposer) {
      setTimeout(() => {
        // Desktop view
        const desktopEl = document.getElementById(`composer-card-${selectedComposer.id}`);
        const desktopViewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]');

        if (desktopEl && desktopViewport) {
          const viewportRect = desktopViewport.getBoundingClientRect();
          const cardRect = desktopEl.getBoundingClientRect();

          const isFullyVisible =
            cardRect.top >= viewportRect.top &&
            cardRect.bottom <= viewportRect.bottom;

          if (!isFullyVisible) {
            desktopEl.scrollIntoView({ behavior: 'auto', block: 'center' });
          }
        }

        // Mobile view
        const mobileEl = document.getElementById(`mobile-composer-card-${selectedComposer.id}`);
        const mobileViewport = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]');

        if (mobileEl && mobileViewport) {
          const viewportRect = mobileViewport.getBoundingClientRect();
          const cardRect = mobileEl.getBoundingClientRect();

          const isFullyVisible =
            cardRect.left >= viewportRect.left &&
            cardRect.right <= viewportRect.right;

          if (!isFullyVisible) {
            mobileEl.scrollIntoView({ behavior: 'auto', inline: 'center' });
          }
        }
      }, 150);
    }
  }, [selectedComposer]);

  useEffect(() => {
    window.addEventListener('resize', scrollToSelectedComposer);
    return () => window.removeEventListener('resize', scrollToSelectedComposer);
  }, [scrollToSelectedComposer]);

  return (
    <div className="w-full mt-3 relative" style={{ height: "65vh" }}>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-1 md:gap-2 h-full">
        <div className="overflow-hidden h-full flex flex-col">
          {/* Mobile horizontal scroll with indicators */}
          <div className="md:hidden flex-shrink-0 relative px-4">
            <ScrollArea key={era} className="w-full h-auto md:h-full scroll-area">
              <div className="inline-flex h-full items-center">
                {allComposers.map((composer, idx) => (
                  <div
                    key={composer.id}
                    id={`mobile-composer-card-${composer.id}`}
                    className="flex-shrink-0 w-56 h-full"
                  >
                    <ComposerCard
                      composer={composer}
                      onClick={() => handleComposerSelect(composer)}
                      isSelected={selectedComposer?.id === composer.id}
                      tabIndex={0}
                      role="button"
                      ariaLabel={`Select composer ${composer.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleComposerSelect(composer);
                        } else if (e.key === 'ArrowRight') {
                          const next = document.getElementById(`mobile-composer-card-${allComposers[idx + 1]?.id}`);
                          if (next) {
                            const focusable = next.querySelector('[tabindex="0"]') as HTMLElement | null;
                            if (focusable) focusable.focus();
                          }
                        } else if (e.key === 'ArrowLeft') {
                          const prev = document.getElementById(`mobile-composer-card-${allComposers[idx - 1]?.id}`);
                          if (prev) {
                            const focusable = prev.querySelector('[tabindex="0"]') as HTMLElement | null;
                            if (focusable) focusable.focus();
                          }
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Horizontal scroll indicators */}
            {!horizontalScroll.isAtStart && (
              <ScrollChevron
                direction="left"
                onClick={() => {
                  const viewport = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]');
                  if (viewport) {
                    viewport.scrollTo({
                      left: Math.max(0, viewport.scrollLeft - 240),
                      behavior: 'smooth'
                    });
                  }
                }}
              />
            )}
            {!horizontalScroll.isAtEnd && (
              <ScrollChevron
                direction="right"
                onClick={() => {
                  const viewport = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]');
                  if (viewport) {
                    viewport.scrollTo({
                      left: viewport.scrollLeft + 240,
                      behavior: 'smooth'
                    });
                  }
                }}
              />
            )}
          </div>

          {/* Desktop vertical scroll with indicators */}
          <div className="hidden md:flex flex-col flex-1 overflow-hidden relative py-4">
            <ScrollArea key={era} className="w-full h-full scroll-area">
              <div className="flex flex-col h-full">
                {allComposers.map((composer, idx) => (
                  <div
                    key={composer.id}
                    id={`composer-card-${composer.id}`}
                    className="flex-shrink-0"
                  >
                    <ComposerCard
                      composer={composer}
                      onClick={() => handleComposerSelect(composer)}
                      isSelected={selectedComposer?.id === composer.id}
                      tabIndex={0}
                      role="button"
                      ariaLabel={`Select composer ${composer.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleComposerSelect(composer);
                        } else if (e.key === 'ArrowDown') {
                          const next = document.getElementById(`composer-card-${allComposers[idx + 1]?.id}`);
                          if (next) {
                            const focusable = next.querySelector('[tabindex="0"]') as HTMLElement | null;
                            if (focusable) focusable.focus();
                          }
                        } else if (e.key === 'ArrowUp') {
                          const prev = document.getElementById(`composer-card-${allComposers[idx - 1]?.id}`);
                          if (prev) {
                            const focusable = prev.querySelector('[tabindex="0"]') as HTMLElement | null;
                            if (focusable) focusable.focus();
                          }
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" className="select-none" />
            </ScrollArea>

            {/* Vertical scroll indicators */}
            {!verticalScroll.isAtTop && (
              <div className="absolute top-0 left-0 right-0 flex justify-center z-20 cursor-pointer">
                <ScrollChevron
                  direction="up"
                  onClick={() => {
                    const viewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]');
                    if (viewport) {
                      viewport.scrollTo({
                        top: Math.max(0, viewport.scrollTop - 180),
                        behavior: 'smooth'
                      });
                    }
                  }}
                />
              </div>
            )}
            {!verticalScroll.isAtBottom && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center z-20 cursor-pointer">
                <ScrollChevron
                  direction="down"
                  onClick={() => {
                    const viewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]');
                    if (viewport) {
                      viewport.scrollTo({
                        top: viewport.scrollTop + 180,
                        behavior: 'smooth'
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {selectedComposer && (
        <div className="flex flex-col h-full overflow-hidden">
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
                  <h3 className="text-xl md:text-2xl font-bold font-serif break-words">
                    {selectedComposer.name}
                  </h3>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 mt-1">
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {selectedComposer.nationality}, {selectedComposer.birthYear}–{selectedComposer.deathYear || 'present'}
                    </span>
                    <div className="flex flex-wrap gap-1 lg:ml-2">
                      {selectedComposer.era.map((era, idx) => (
                        <Badge key={era + idx} variant="badge" className="text-xs">
                          {era}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
              {/* Scrollable content starts here */}
              <div className="relative flex-1 min-h-0">
                <ScrollArea className="h-full">
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
                {/* Scroll shadow for all screen sizes */}
                <div className="pointer-events-none absolute bottom-0 left-0 w-full h-5 bg-gradient-to-t from-background to-transparent z-10" />
              </div>

            </div>

            <div className="flex-shrink-0 h-14 md:h-16 px-3 md:px-4 py-2 bg-background relative z-20">
              <Button
                onClick={() => {
                  if (selectedComposer && isComposerInPublicDomain(selectedComposer)) {
                    onStartChat(selectedComposer);
                  }
                }}
                disabled={!selectedComposer || !isComposerInPublicDomain(selectedComposer)}
                className={`
                  w-full h-full text-sm md:text-base transition-transform duration-300
                  ${
                    selectedComposer && isComposerInPublicDomain(selectedComposer)
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
