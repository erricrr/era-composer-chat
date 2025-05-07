import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Composer } from '@/data/composers';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComposerSearchProps {
  composers: Composer[];
  onSelectComposer: (composer: Composer) => void;
  selectedComposer: Composer | null;
}

export function ComposerSearch({ composers, onSelectComposer }: ComposerSearchProps) {
  // Core states
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredComposers, setFilteredComposers] = useState<Composer[]>([]);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

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
    } else {
      console.log("[Search] Closing mobile search");
      setIsMobileSearchActive(false);
    }
  }, [searchQuery]);

  // Handle selecting a composer
  const handleSelect = useCallback((composer: Composer) => {
    console.log("[Search] Selected composer:", composer.name);
    onSelectComposer(composer);
    setSearchQuery('');
    setFilteredComposers([]);
    setIsOpen(false);
    setHasSearched(false);
    setActiveResultIndex(-1);
    setIsMobileSearchActive(false);
  }, [onSelectComposer]);

  // Activate mobile search
  const activateMobileSearch = useCallback(() => {
    setIsMobileSearchActive(true);
    // Focus input after activation
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Keyboard navigation for search results
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredComposers.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveResultIndex((prevIndex) =>
          prevIndex < filteredComposers.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveResultIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : -1
        );
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

  // Scroll active result into view
  useEffect(() => {
    if (activeResultIndex >= 0 && resultRefs.current[activeResultIndex]) {
      resultRefs.current[activeResultIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeResultIndex]);

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

  // Add media query listener to reset mobile search on screen resize
  useEffect(() => {
    // Media query for md breakpoint (typically 768px)
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    // Handler to reset mobile search if screen becomes larger than md breakpoint
    const handleScreenChange = (e: MediaQueryListEvent) => {
      if (e.matches && isMobileSearchActive) {
        // If screen size changes to desktop (md+), reset mobile search active state
        setIsMobileSearchActive(false);
      }
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleScreenChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleScreenChange);
    };
  }, [isMobileSearchActive]);

  // Determine whether to show results
  const shouldShowResults = searchQuery.trim().length > 0;

  return (
    <div className="relative flex items-center md:w-[230px]" ref={containerRef}>
      {/* Mobile-Only Search Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`w-7 h-7 flex-shrink-0 md:hidden ${isMobileSearchActive ? 'hidden' : 'flex'} rounded-full hover:bg-muted`}
        onClick={activateMobileSearch}
        aria-label="Open search bar"
      >
        <Search className="h-5 w-5 text-muted-foreground" />
      </Button>

      {/* Search Input Container */}
      <div
        className={cn(
          "relative overflow-visible bg-background focus-within:bg-primary/5 rounded-full transition-all duration-200",
          isMobileSearchActive ? "w-full" : "hidden",
          "md:block md:w-full"
        )}
        style={{ position: 'relative', zIndex: 1000 }}
      >
        {/* Input with icons */}
        <div className="flex items-center px-3 rounded-full">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all composers..."
            className="flex-1 py-2 outline-none bg-transparent text-xs"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchQuery.trim().length > 0) {
                performFilter(searchQuery);
                setIsOpen(true);
              }
            }}
            aria-label="Search composers"
          />
          {(searchQuery || isMobileSearchActive) && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-secondary/30 rounded-full text-muted-foreground/60 hover:text-muted-foreground"
              type="button"
              aria-label="Clear or close search"
            >
              <X className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {shouldShowResults && (
          <div
            className="absolute top-[calc(100%+4px)] left-0 right-0 w-full"
            style={{ zIndex: 1000 }}
          >
            <div className="rounded-lg border border-border bg-card shadow-md">
              <div className="max-h-[200px] overflow-y-auto p-1">
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
                        onClick={() => handleSelect(composer)}
                        onMouseEnter={() => setActiveResultIndex(index)}
                        onMouseLeave={() => setActiveResultIndex(-1)}
                        className={`py-1.5 px-3 font-serif text-foreground rounded-full cursor-pointer text-xs md:text-sm
                          ${index === activeResultIndex
                            ? 'bg-secondary/80'
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
