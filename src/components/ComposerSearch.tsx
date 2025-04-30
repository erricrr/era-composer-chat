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
  selectedComposer: Composer | null; // Keep this prop for potential future use, but don't rely on it for clearing
}

export function ComposerSearch({ composers, onSelectComposer }: ComposerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredComposers, setFilteredComposers] = useState<Composer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);

  // Debounce function (simple implementation)
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Filter logic
  const performFilter = useCallback((query: string) => {
    console.log("[Search] Performing filter for:", query);
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) {
      setFilteredComposers([]);
      setIsOpen(false);
      return;
    }
    try {
      const filtered = composers.filter((composer) => {
        // Add checks for undefined properties before accessing methods
        const name = composer.name || '';
        const nationality = composer.nationality || '';
        const eras = Array.isArray(composer.era) ? composer.era : [];
        const works = Array.isArray(composer.famousWorks) ? composer.famousWorks : [];

        const matchesName = name.toLowerCase().includes(lowerQuery);
        const matchesNationality = nationality.toLowerCase().includes(lowerQuery);
        const matchesEra = eras.some(era => era.toLowerCase().includes(lowerQuery));
        const matchesWorks = works.some(work => work.toLowerCase().includes(lowerQuery));

        return matchesName || matchesNationality || matchesEra || matchesWorks;
      });
      console.log("[Search] Filtered results:", filtered.length);
      setFilteredComposers(filtered);
      setIsOpen(true);
    } catch (error) {
      console.error("[Search] Error during filtering:", error);
      setFilteredComposers([]);
      setIsOpen(false);
    }
  }, [composers]);

  // Debounced filter
  const debouncedFilter = useCallback(debounce(performFilter, 200), [performFilter]);

  // Handle input changes
  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedFilter(value);
  }, [debouncedFilter]);

  // Handle clearing the search - also deactivates mobile search view
  const handleClear = useCallback(() => {
    console.log("[Search] Clearing search & mobile active state");
    setSearchQuery('');
    setFilteredComposers([]);
    setIsOpen(false);
    setIsMobileSearchActive(false);
  }, []);

  // Handle selecting a composer from results - uses handleClear now
  const handleSelect = useCallback((composer: Composer) => {
    console.log("[Search] Selecting composer:", composer.name);
    try {
      onSelectComposer(composer); // Notify parent
      console.log("[Search] Notified parent of selection");
      // Use handleClear which now also resets mobile state
      handleClear();
    } catch (error) {
      console.error("[Search] Error during selection notification or clear:", error);
    }
  }, [onSelectComposer, handleClear]);

  // Handler to activate mobile search input
  const activateMobileSearch = useCallback(() => {
    setIsMobileSearchActive(true);
  }, []);

  // Focus input when mobile search becomes active
  useEffect(() => {
    if (isMobileSearchActive) {
      // Use timeout to ensure input is visible before focusing
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isMobileSearchActive]);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log("[Search] Rendering - MobileActive:", isMobileSearchActive, "Query:", searchQuery, "isOpen:", isOpen);

  return (
    <div className="relative flex items-center md:w-[280px]">
      {/* Mobile-Only Search Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`flex-shrink-0 md:hidden ${isMobileSearchActive ? 'hidden' : 'flex'}`}
        onClick={activateMobileSearch}
        aria-label="Open search bar"
      >
        <Search className="h-5 w-5 text-muted-foreground" />
      </Button>

      {/* Command component - Always rendered, conditional styling */}
      <Command
        ref={commandRef}
        className={cn(
          "rounded-lg border border-border bg-card shadow-sm overflow-visible transition-all duration-200 ease-out relative",
          isMobileSearchActive ? "w-full" : "hidden",
          "md:block md:w-full"
        )}
      >
        {/* Input Wrapper */}
        <div
          className={"flex items-center border-b border-border px-3"}
          cmdk-input-wrapper=""
        >
          <CommandInput
            ref={inputRef}
            id="composer-search-input"
            placeholder="Search all composers..."
            className="h-9 flex-1 bg-transparent font-serif text-sm placeholder:text-muted-foreground/70 outline-none border-none ring-0 focus:ring-0"
            value={searchQuery}
            onValueChange={handleInputChange}
            autoComplete="off"
            aria-label="Search composers"
            onFocus={() => setIsOpen(true)}
          />
          {(isMobileSearchActive || searchQuery) && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-secondary/80 rounded-full text-muted-foreground hover:text-foreground"
              type="button"
              aria-label="Clear or close search"
            >
              <X className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>

        {/* Results List - Directly inside Command, visibility controlled by CSS */}
        <div
          className={cn(
             "absolute top-[calc(100%+4px)] left-0 right-0 z-50 w-full",
             !isOpen && "hidden"
          )}
        >
          <div className="rounded-lg border border-border bg-card shadow-md">
            <CommandList className="max-h-[200px] overflow-y-auto p-1">
               {filteredComposers.length === 0 && searchQuery ? (
                 <CommandEmpty className="py-2 px-3 text-center text-sm text-muted-foreground">
                   No composers found.
                 </CommandEmpty>
               ) : null}
              {filteredComposers.length > 0 && (
                <CommandGroup>
                  {filteredComposers.map((composer) => (
                    <CommandItem
                      key={composer.id}
                      onSelect={() => handleSelect(composer)}
                      className="py-1.5 px-3 font-serif text-sm text-foreground rounded-md hover:bg-secondary/80 cursor-pointer data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground"
                      value={composer.name}
                    >
                      {composer.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        </div>
      </Command>
    </div>
  );
}
