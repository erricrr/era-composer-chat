import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Composer } from '@/data/composers';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ComposerSearchProps {
  composers: Composer[];
  onSelectComposer: (composer: Composer) => void;
  selectedComposer: Composer | null;
}

export function ComposerSearch({ composers, onSelectComposer }: ComposerSearchProps) {
  // Constants
  const SEARCH_PLACEHOLDER = "Search composers";

  // Core states
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredComposers, setFilteredComposers] = useState<Composer[]>([]);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

  // Initialize isMobileView with the current screen size
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false; // Default to desktop for SSR
  });

  // UI states
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Memoize text normalization function
  const normalizeText = useMemo(() => {
    return (text: string): string => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    };
  }, []);

  // Memoize name parts extraction
  const getSearchableNameParts = useMemo(() => {
    return (composer: Composer): string[] => {
      return composer.name.split(' ').map(part => normalizeText(part));
    };
  }, [normalizeText]);

  // Filter logic with improved name matching
  const performFilter = useCallback((query: string) => {
    setIsLoading(true);
    console.log("[Search] Performing filter for:", query);

    const trimmedQuery = query.trim();

    // Clear results if query is empty
    if (!trimmedQuery) {
      setFilteredComposers([]);
      setIsOpen(false);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setHasSearched(true);

    try {
      const normalizedQuery = normalizeText(trimmedQuery);

      const filtered = composers
        .filter((composer) => {
          const nameParts = getSearchableNameParts(composer);
          const fullName = normalizeText(composer.name);

          return nameParts.some(part => part.includes(normalizedQuery)) ||
                 fullName.includes(normalizedQuery);
        })
        .sort((a, b) => {
          const aName = normalizeText(a.name);
          const bName = normalizeText(b.name);

          // Exact match gets highest priority
          if (aName === normalizedQuery) return -1;
          if (bName === normalizedQuery) return 1;

          // Then check for matches at the start of any name part
          const aNameParts = getSearchableNameParts(a);
          const bNameParts = getSearchableNameParts(b);

          const aStartsWithQuery = aNameParts.some(part => part.startsWith(normalizedQuery));
          const bStartsWithQuery = bNameParts.some(part => part.startsWith(normalizedQuery));

          if (aStartsWithQuery && !bStartsWithQuery) return -1;
          if (bStartsWithQuery && !aStartsWithQuery) return 1;

          // Finally, sort by how early the match occurs in the full name
          return aName.indexOf(normalizedQuery) - bName.indexOf(normalizedQuery);
        });

      console.log("[Search] Found matches:", filtered.length);
      setFilteredComposers(filtered);
      setIsOpen(filtered.length > 0);
    } catch (error) {
      console.error("[Search] Error during filtering:", error);
      setFilteredComposers([]);
    }

    setIsLoading(false);
  }, [composers, normalizeText, getSearchableNameParts]);

  // Handle input changes with debounce
  const handleInputChange = useCallback((value: string) => {
    console.log("[Search] Input changed:", value);
    setSearchQuery(value);
    performFilter(value);
  }, [performFilter]);

  // Handle clearing the search
  const handleClear = useCallback(() => {
    if (searchQuery) {
      console.log("[Search] Clearing query");
      setSearchQuery('');
      setFilteredComposers([]);
      setIsOpen(false);
      setHasSearched(false);
      // Focus input after clearing
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (isMobileView) {
      console.log("[Search] Closing mobile search");
      setIsMobileSearchActive(false);
    }
    // On desktop with no query, do nothing when X is clicked
  }, [searchQuery, isMobileView]);

  // Track last announcement for status changes
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('');

  // Update search status announcements
  useEffect(() => {
    if (!searchQuery && hasSearched) {
      setStatusAnnouncement('Search cleared.');
    } else if (!isOpen && hasSearched && filteredComposers.length > 0) {
      setStatusAnnouncement('Search results closed.');
    } else {
      setStatusAnnouncement('');
    }
  }, [searchQuery, isOpen, hasSearched, filteredComposers.length]);

  // Handle selecting a composer
  const handleSelect = useCallback((composer: Composer) => {
    console.log("[Search] Selected composer:", composer.name);
    console.log("[Search] Current view is mobile:", isMobileView);

    // Set status announcement for selected composer
    setStatusAnnouncement(`Selected composer ${composer.name}. Navigating to composer page.`);

    onSelectComposer(composer);

    // Clear the search query and results
    setSearchQuery('');
    setFilteredComposers([]);
    setIsOpen(false);
    setHasSearched(false);
    setActiveResultIndex(-1);

    // Always close the mobile search after selecting a composer
    // This ensures the zoom state is reset on mobile
    setIsMobileSearchActive(false);
  }, [onSelectComposer, isMobileView]);

  // Activate mobile search
  const activateMobileSearch = useCallback(() => {
    setIsMobileSearchActive(true);
    // Focus input after activation
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Effect to update usingKeyboard based on interaction type
  useEffect(() => {
    const handlePointer = () => {
      setUsingKeyboard(false);
      document.body.classList.remove('using-keyboard');
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        setUsingKeyboard(true);
        document.body.classList.add('using-keyboard');
      }
    };

    window.addEventListener('mousedown', handlePointer);
    window.addEventListener('touchstart', handlePointer);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('touchstart', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Keyboard navigation for search results
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredComposers.length === 0) return;

    // Set using keyboard to true to display focus rings
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      setUsingKeyboard(true);
      document.body.classList.add('using-keyboard');
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveResultIndex((prevIndex) => {
          const newIndex = prevIndex < filteredComposers.length - 1 ? prevIndex + 1 : prevIndex;
          return newIndex;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveResultIndex((prevIndex) => {
          const newIndex = prevIndex > 0 ? prevIndex - 1 : -1;
          return newIndex;
        });
        break;
      case 'Enter':
        event.preventDefault();
        if (activeResultIndex >= 0 && activeResultIndex < filteredComposers.length) {
          handleSelect(filteredComposers[activeResultIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setActiveResultIndex(-1);
        break;
    }
  }, [isOpen, filteredComposers, activeResultIndex, handleSelect]);

  // When dropdown closes, reset active index and focus input
  useEffect(() => {
    if (!isOpen) {
      setActiveResultIndex(-1);
    }
  }, [isOpen]);

  // Scroll active result into view
  useEffect(() => {
    if (activeResultIndex >= 0 && resultRefs.current[activeResultIndex]) {
      resultRefs.current[activeResultIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeResultIndex]);

  // State to track if last interaction was keyboard navigation
  const [usingKeyboard, setUsingKeyboard] = useState(false);

  // State to track when the search box has focus
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Determine whether to show results
  const shouldShowResults = searchQuery.trim().length > 0;

  // Update status announcement when search results change
  useEffect(() => {
    if (hasSearched && !isLoading) {
      if (filteredComposers.length === 0) {
        setStatusAnnouncement(`No composers found matching "${searchQuery}". Try a different search term.`);
      } else {
        setStatusAnnouncement(`Found ${filteredComposers.length} composer${filteredComposers.length !== 1 ? 's' : ''} matching "${searchQuery}". Use up and down arrow keys to navigate results.`);
      }

      // Clear announcement after it's been read
      const timer = setTimeout(() => {
        setStatusAnnouncement('');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [filteredComposers.length, hasSearched, isLoading, searchQuery]);

  // Handle selection changes for announcements
  useEffect(() => {
    if (activeResultIndex >= 0 && filteredComposers[activeResultIndex]) {
      // Don't announce selection changes from mouse interaction
      if (usingKeyboard) {
        setStatusAnnouncement(`Selected: ${filteredComposers[activeResultIndex].name}. Press Enter to view this composer.`);

        // Clear announcement after it's been read
        const timer = setTimeout(() => {
          setStatusAnnouncement('');
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [activeResultIndex, filteredComposers, usingKeyboard]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveResultIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when mobile search becomes active
  useEffect(() => {
    if (isMobileSearchActive) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isMobileSearchActive]);

  // Effect to track screen size
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip for SSR

    // Media query for md breakpoint
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    // Set initial state
    setIsMobileView(!mediaQuery.matches);

    // Handler for screen size changes
    const handleScreenChange = (e: MediaQueryListEvent) => {
      setIsMobileView(!e.matches);
    };

    // Also handle window resize directly for redundancy
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Listen for changes
    mediaQuery.addEventListener('change', handleScreenChange);
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleScreenChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add media query listener to reset mobile search on screen resize
  useEffect(() => {
    // Media query for md breakpoint (typically 768px)
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    // Handler to reset mobile search if screen becomes larger than md breakpoint
    const handleScreenChange = (e: MediaQueryListEvent) => {
      // ONLY reset mobile search active state when transitioning FROM mobile TO desktop
      if (e.matches && isMobileSearchActive) {
        // If screen size changes to desktop (md+), reset mobile search active state
        setIsMobileSearchActive(false);
      }
      // Do NOT set isMobileSearchActive when going from desktop to mobile
      // This ensures the search bar stays closed on mobile until user explicitly opens it
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleScreenChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleScreenChange);
    };
  }, [isMobileSearchActive]);

  return (
    <div
      className={cn(
        "relative flex items-center transition-all duration-200",
        isMobileSearchActive ? "w-64" : "w-11",
        "md:w-64",
        isMobileView && !isMobileSearchActive && "justify-center"
      )}
      ref={containerRef}
    >
      {/* Enhanced live region for search results */}
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions text"
        className="sr-only"
      >
        {statusAnnouncement && statusAnnouncement}
        {isLoading && "Searching composers..."}
        {isInputFocused && !searchQuery && "Type to search for composers. Results will appear as you type."}
        {hasSearched && !isLoading && !statusAnnouncement && (
          filteredComposers.length > 0
            ? `Found ${filteredComposers.length} composer${filteredComposers.length !== 1 ? 's' : ''} matching "${searchQuery}". Use up and down arrow keys to navigate results.`
            : `No composers found matching "${searchQuery}". Try a different search term.`
        )}
        {activeResultIndex >= 0 && filteredComposers[activeResultIndex] &&
          `Selected: ${filteredComposers[activeResultIndex].name}. Press Enter to view this composer.`
        }
      </div>

      {/* Mobile-Only Search Icon Button with conditional tooltip */}
      {!isMobileSearchActive && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="w-11 h-11 flex items-center justify-center rounded-md md:hidden hover:bg-muted transition-colors duration-200 composer-search-mobile-button"
              onClick={(e) => {
                e.stopPropagation();
                setTimeout(activateMobileSearch, 10);
              }}
              aria-label="Open search bar"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} className="text-xs">
            {SEARCH_PLACEHOLDER}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Search Input Container */}
      <div
        className={cn(
          "relative overflow-visible rounded-md bg-background transition-all duration-200",
          isMobileSearchActive ? "w-full" : "hidden",
          "md:block md:w-full"
        )}
        style={{ position: 'relative', zIndex: 65 }}
      >
        {/* Input with icons */}
        <div className="flex items-center px-3">
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={SEARCH_PLACEHOLDER}
              className="composer-search-input w-full py-2 pl-10 pr-15 text-sm md:text-sm bg-transparent placeholder:text-muted-foreground transition-colors duration-200"
              style={{ fontSize: isMobileView ? '16px' : '' }}
              aria-label="Search for composers"
              role="combobox"
              aria-expanded={isOpen}
              aria-owns="search-results"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-activedescendant={activeResultIndex >= 0 ? `search-result-${activeResultIndex}` : undefined}
            />

            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          {/* Show X button in these cases:
              1. On ANY screen size when there's a search query
              2. OR on mobile only when the mobile search is active (to close/hide the search) */}
          {(searchQuery || (isMobileSearchActive && isMobileView)) && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center rounded-full hover:bg-secondary/30 text-muted-foreground/60 hover:text-muted-foreground w-8 h-8 composer-search-clear-button"
              type="button"
              aria-label={searchQuery ? "Clear search" : "Close search"}
              data-testid="search-clear-button"
            >
              <X className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}
        </div>

        {/* Results dropdown - only render when needed */}
        {shouldShowResults && isOpen && (
          <div
            className="absolute top-[calc(100%+4px)] left-0 right-0 w-full"
            style={{ zIndex: 65 }}
          >
            <div className="rounded-lg border border-border bg-card shadow-md">
              <div
                className="max-h-[200px] overflow-y-auto p-1"
                id="search-results"
                role="listbox"
                aria-label="Search suggestions"
              >
                {/* Loading indicator */}
                {isLoading && (
                  <div className="py-2 px-3 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}

                {/* No results message */}
                {!isLoading && filteredComposers.length === 0 && hasSearched && (
                  <div className="py-2 px-3 text-center text-sm text-muted-foreground">
                    No composers found.
                  </div>
                )}

                {/* Results list */}
                {!isLoading && filteredComposers.length > 0 && (
                  <div className="relative">
                    {filteredComposers.map((composer, index) => (
                      <div
                        ref={(el) => resultRefs.current[index] = el}
                        key={composer.id}
                        id={`search-result-${index}`}
                        onClick={() => handleSelect(composer)}
                        onMouseEnter={() => {
                          setActiveResultIndex(index);
                          // Avoid focusing with mouse interactions
                          setUsingKeyboard(false);
                          document.body.classList.remove('using-keyboard');
                        }}
                        onMouseLeave={() => {
                          if (!usingKeyboard) setActiveResultIndex(-1);
                        }}
                        role="option"
                        aria-selected={index === activeResultIndex}
                        className={`py-1.5 px-3 text-foreground rounded-md cursor-pointer text-xs md:text-sm
                          ${index === activeResultIndex
                            ? usingKeyboard
                              ? 'bg-secondary/80 ring-2 ring-primary ring-inset'
                              : 'bg-secondary/80'
                            : 'hover:bg-secondary/30'}
                        `}
                      >
                        {composer.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
