import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if a string contains consecutive characters from the search query
  const containsConsecutiveChars = useCallback((str: string, query: string): boolean => {
    if (!str || !query) return false;

    const lowerStr = str.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let strIndex = 0;
    for (let queryIndex = 0; queryIndex < lowerQuery.length; queryIndex++) {
      const charIndex = lowerStr.indexOf(lowerQuery[queryIndex], strIndex);
      if (charIndex === -1) return false;
      strIndex = charIndex + 1;
    }

    return true;
  }, []);

  // Filter logic
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
      const filtered = composers.filter((composer) => {
        const name = composer.name || '';
        const nationality = composer.nationality || '';
        const eras = Array.isArray(composer.era) ? composer.era : [];
        const works = Array.isArray(composer.famousWorks) ? composer.famousWorks : [];

        const matchesName = containsConsecutiveChars(name, trimmedQuery);
        const matchesNationality = containsConsecutiveChars(nationality, trimmedQuery);
        const matchesEra = eras.some(era => containsConsecutiveChars(era, trimmedQuery));
        const matchesWorks = works.some(work => containsConsecutiveChars(work, trimmedQuery));

        return matchesName || matchesNationality || matchesEra || matchesWorks;
      });

      setFilteredComposers(filtered);
      setIsOpen(true);
    } catch (error) {
      console.error("[Search] Error during filtering:", error);
      setFilteredComposers([]);
    }

    setIsLoading(false);
  }, [composers, containsConsecutiveChars]);

  // Debounced filter
  const debouncedFilter = useCallback((query: string) => {
    const handler = setTimeout(() => {
      performFilter(query);
    }, 200);

    return () => clearTimeout(handler);
  }, [performFilter]);

  // Handle input changes
  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedFilter(value);
  }, [debouncedFilter]);

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
  }, [onSelectComposer]);

  // Activate mobile search
  const activateMobileSearch = useCallback(() => {
    setIsMobileSearchActive(true);
    // Focus input after activation
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

  // Determine whether to show results
  const shouldShowResults = isOpen && searchQuery.trim().length > 0;

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
      >
        {/* Input with icons */}
        <div className="flex items-center px-3 rounded-full">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all composers..."
            className="flex-1 py-2 outline-none bg-transparent text-sm"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 0) {
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
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 w-full">
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
                  <div>
                    {filteredComposers.map((composer) => (
                      <div
                        key={composer.id}
                        onClick={() => handleSelect(composer)}
                        className="py-1.5 px-3 font-serif text-foreground rounded-full hover:bg-secondary/80 cursor-pointer text-xs md:text-sm"
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
