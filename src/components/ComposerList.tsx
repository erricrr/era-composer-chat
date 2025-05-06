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

    // Call the selection handler first
    try {
      onSelectComposer(composer, { source: 'list' });
      console.log("[List] onSelectComposer called successfully");
    } catch (error) {
      console.error("[List] Error calling onSelectComposer:", error);
    }

    // Smart scroll handling
    setTimeout(() => {
      // Handle mobile horizontal scroll
      const mobileElement = document.getElementById(`mobile-composer-card-${composer.id}`);
      const mobileViewport = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]');

      if (mobileElement && mobileViewport) {
        const viewportRect = mobileViewport.getBoundingClientRect();
        const cardRect = mobileElement.getBoundingClientRect();

        // Calculate how much of the card is out of view
        const leftOverflow = viewportRect.left - cardRect.left;
        const rightOverflow = cardRect.right - viewportRect.right;

        if (leftOverflow > 0) {
          // Card is partially hidden on the left
          mobileViewport.scrollBy({
            left: -leftOverflow,
            behavior: 'smooth'
          });
        } else if (rightOverflow > 0) {
          // Card is partially hidden on the right
          mobileViewport.scrollBy({
            left: rightOverflow,
            behavior: 'smooth'
          });
        }
      }

      // Handle desktop vertical scroll
      const desktopElement = document.getElementById(`composer-card-${composer.id}`);
      const desktopViewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]');

      if (desktopElement && desktopViewport) {
        const viewportRect = desktopViewport.getBoundingClientRect();
        const cardRect = desktopElement.getBoundingClientRect();

        // Calculate how much of the card is out of view
        const topOverflow = viewportRect.top - cardRect.top;
        const bottomOverflow = cardRect.bottom - viewportRect.bottom;

        if (topOverflow > 0) {
          // Card is partially hidden at the top
          desktopViewport.scrollBy({
            top: -topOverflow,
            behavior: 'smooth'
          });
        } else if (bottomOverflow > 0) {
          // Card is partially hidden at the bottom
          desktopViewport.scrollBy({
            top: bottomOverflow,
            behavior: 'smooth'
          });
        }
      }
    }, 0);
  }, [onSelectComposer]);

  // Effect to restore scroll position on era change
  useEffect(() => {
    // Restore mobile scroll position
    setTimeout(() => {
      const mobileViewport = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (mobileViewport) {
        const pos = getMobileScrollPosition(era);
        mobileViewport.scrollTo({ left: pos, behavior: 'auto' });
      }
    }, 0);
    // Restore desktop scroll position
    setTimeout(() => {
      const desktopViewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (desktopViewport) {
        const pos = getDesktopScrollPosition(era);
        desktopViewport.scrollTo({ top: pos, behavior: 'auto' });
      }
    }, 0);
  }, [era, getMobileScrollPosition, getDesktopScrollPosition]);

  // Save scroll position on scroll for mobile and desktop
  useEffect(() => {
    const mobileViewport = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement | null;
    const desktopViewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]') as HTMLElement | null;

    const handleMobileScroll = () => {
      if (mobileViewport) {
        setMobileScrollPosition(era, mobileViewport.scrollLeft);
      }
    };
    const handleDesktopScroll = () => {
      if (desktopViewport) {
        setDesktopScrollPosition(era, desktopViewport.scrollTop);
      }
    };

    if (mobileViewport) {
      mobileViewport.addEventListener('scroll', handleMobileScroll);
    }
    if (desktopViewport) {
      desktopViewport.addEventListener('scroll', handleDesktopScroll);
    }
    return () => {
      if (mobileViewport) {
        mobileViewport.removeEventListener('scroll', handleMobileScroll);
      }
      if (desktopViewport) {
        desktopViewport.removeEventListener('scroll', handleDesktopScroll);
      }
    };
  }, [era, setMobileScrollPosition, setDesktopScrollPosition]);

  // Effect to scroll selected composer into view
  useEffect(() => {
    if (selectedComposer && shouldScrollToComposer) {
      let scrolled = false;
      setTimeout(() => {
        const desktopElement = document.getElementById(`composer-card-${selectedComposer.id}`);
        if (desktopElement) {
          desktopElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          scrolled = true;
        }
        const mobileElement = document.getElementById(`mobile-composer-card-${selectedComposer.id}`);
        if (mobileElement) {
          mobileElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          scrolled = true;
        }
        if (scrolled) {
          onScrollComplete();
        }
      }, 0);
    }
  }, [selectedComposer, shouldScrollToComposer, onScrollComplete]);

  // Check scroll position when content changes
  useEffect(() => {
    const checkHorizontalScroll = () => {
      // Get mobile scrollable container from DOM
      const horizontalScroller = document.querySelector('.md\\:hidden .scroll-area');
      if (!horizontalScroller) return;

      const scrollView = horizontalScroller.querySelector('[data-radix-scroll-area-viewport]');

      if (scrollView) {
        const scrollLeft = scrollView.scrollLeft;
        const scrollWidth = scrollView.scrollWidth;
        const clientWidth = scrollView.clientWidth;

        // Add a small buffer for accurate detection
        const buffer = 2;

        console.log("[List] Horizontal scroll check:", {
          scrollLeft,
          scrollWidth,
          clientWidth,
          isAtStart: scrollLeft <= buffer,
          isAtEnd: Math.abs((scrollLeft + clientWidth) - scrollWidth) <= buffer
        });

        setHorizontalScroll({
          isAtStart: scrollLeft <= buffer,
          isAtEnd: Math.abs((scrollLeft + clientWidth) - scrollWidth) <= buffer
        });
      }
    };

    const checkVerticalScroll = () => {
      // Get desktop scrollable container from DOM
      const verticalScroller = document.querySelector('.md\\:flex .scroll-area');
      if (!verticalScroller) return;

      const scrollView = verticalScroller.querySelector('[data-radix-scroll-area-viewport]');

      if (scrollView) {
        const scrollTop = scrollView.scrollTop;
        const scrollHeight = scrollView.scrollHeight;
        const clientHeight = scrollView.clientHeight;

        // Add a small buffer for accurate detection
        const buffer = 2;

        console.log("[List] Vertical scroll check:", {
          scrollTop,
          scrollHeight,
          clientHeight,
          isAtTop: scrollTop <= buffer,
          isAtBottom: Math.abs((scrollTop + clientHeight) - scrollHeight) <= buffer
        });

        setVerticalScroll({
          isAtTop: scrollTop <= buffer,
          isAtBottom: Math.abs((scrollTop + clientHeight) - scrollHeight) <= buffer
        });
      }
    };

    // Initial check
    setTimeout(() => {
      checkHorizontalScroll();
      checkVerticalScroll();
    }, 500);

    // Add scroll event listeners to the actual scrollable elements
    const addScrollListeners = () => {
      const horizontalViewport = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]');
      const verticalViewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]');

      if (horizontalViewport) {
        console.log("[List] Adding horizontal scroll listener");
        horizontalViewport.addEventListener('scroll', checkHorizontalScroll);
      }

      if (verticalViewport) {
        console.log("[List] Adding vertical scroll listener");
        verticalViewport.addEventListener('scroll', checkVerticalScroll);
      }
    };

    // Delay to ensure DOM elements are available
    const timer = setTimeout(addScrollListeners, 1000);

    return () => {
      clearTimeout(timer);

      // Clean up event listeners
      const horizontalViewport = document.querySelector('.md\\:hidden .scroll-area [data-radix-scroll-area-viewport]');
      const verticalViewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]');

      if (horizontalViewport) {
        horizontalViewport.removeEventListener('scroll', checkHorizontalScroll);
      }

      if (verticalViewport) {
        verticalViewport.removeEventListener('scroll', checkVerticalScroll);
      }
    };
  }, [era]); // Re-run when era changes

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
                          // Focus next card
                          const next = document.getElementById(`mobile-composer-card-${allComposers[idx + 1]?.id}`);
                          if (next) {
                            const focusable = next.querySelector('[tabindex="0"]') as HTMLElement | null;
                            if (focusable) focusable.focus();
                          }
                        } else if (e.key === 'ArrowLeft') {
                          // Focus previous card
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
                    const currentScroll = viewport.scrollLeft;
                    viewport.scrollTo({
                      left: Math.max(0, currentScroll - 240),
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
                    const currentScroll = viewport.scrollLeft;
                    viewport.scrollTo({
                      left: currentScroll + 240,
                      behavior: 'smooth'
                    });
                  }
                }}
              />
            )}
          </div>

          {/* Desktop vertical scroll with indicators */}
          <div className="hidden md:flex flex-col flex-1 overflow-hidden relative py-4">
            <ScrollArea key={era} className="w-full h-auto md:h-full scroll-area">
              <div className="flex flex-col">
                {allComposers.map((composer, idx) => (
                  <div
                    key={composer.id}
                    id={`composer-card-${composer.id}`}
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
                          // Focus next card
                          const next = document.getElementById(`composer-card-${allComposers[idx + 1]?.id}`);
                          if (next) {
                            const focusable = next.querySelector('[tabindex="0"]') as HTMLElement | null;
                            if (focusable) focusable.focus();
                          }
                        } else if (e.key === 'ArrowUp') {
                          // Focus previous card
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
              <ScrollBar orientation="vertical" />
            </ScrollArea>

            {/* Vertical scroll indicators */}
            {!verticalScroll.isAtTop && (
              <div className="absolute top-0 left-0 right-0 flex justify-center z-20 cursor-pointer">
                <ScrollChevron
                  direction="up"
                  onClick={() => {
                    const viewport = document.querySelector('.md\\:flex .scroll-area [data-radix-scroll-area-viewport]');
                    if (viewport) {
                      const currentScroll = viewport.scrollTop;
                      viewport.scrollTo({
                        top: currentScroll - 180,
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
                      const currentScroll = viewport.scrollTop;
                      viewport.scrollTo({
                        top: currentScroll + 180,
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
            <div className="px-3 md:px-4 pt-1">
              <div className="flex items-start md:items-center space-x-2 md:space-x-6 border-b pt-2 md:pt-0" style={{ paddingBottom: '10px' }}>
                <ComposerImageViewer
                  composer={selectedComposer}
                  size="xl"
                  allowModalOnDesktop={true}
                />
                <div className="flex-1 min-w-0">
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
              <ScrollArea className="flex-1 relative">
                <div className="p-3 space-y-2 md:space-y-4">
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

                {/* Scroll shadow for all screen sizes */}
                <div className="pointer-events-none absolute bottom-0 left-0 w-full h-5 bg-gradient-to-t from-background to-transparent z-10" />
              </ScrollArea>

            </div>

            <div className="flex-shrink-0 h-14 md:h-16 px-3 md:px-4 py-2 bg-background">
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
