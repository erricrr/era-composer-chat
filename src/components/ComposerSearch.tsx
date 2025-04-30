import { useState, useCallback } from 'react';
import { Composer } from '@/data/composers';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { X } from 'lucide-react';

interface ComposerSearchProps {
  composers: Composer[];
  onSelectComposer: (composer: Composer) => void;
  selectedComposer: Composer | null; // Keep this prop for potential future use, but don't rely on it for clearing
}

export function ComposerSearch({ composers, onSelectComposer }: ComposerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredComposers, setFilteredComposers] = useState<Composer[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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
        const matchesName = composer.name.toLowerCase().includes(lowerQuery);
        const matchesNationality = composer.nationality.toLowerCase().includes(lowerQuery);
        const matchesEra = composer.era.some(era => era.toLowerCase().includes(lowerQuery));
        const matchesWorks = composer.famousWorks.some(work => work.toLowerCase().includes(lowerQuery));
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
    console.log("[Search] Input changed:", value);
    setSearchQuery(value);
    debouncedFilter(value);
  }, [debouncedFilter]);

  // Handle clearing the search
  const handleClear = useCallback(() => {
    console.log("[Search] Clearing search");
    setSearchQuery('');
    setFilteredComposers([]);
    setIsOpen(false);
  }, []);

  // Handle selecting a composer from results
  const handleSelect = useCallback((composer: Composer) => {
    console.log("[Search] Selecting composer:", composer.name);
    try {
      onSelectComposer(composer); // Notify parent
      console.log("[Search] Notified parent of selection");
      handleClear(); // Clear the search UI
      console.log("[Search] Cleared search UI after selection");
    } catch (error) {
      console.error("[Search] Error during selection notification or clear:", error);
    }
  }, [onSelectComposer, handleClear]);

  console.log("[Search] Rendering with query:", searchQuery, "isOpen:", isOpen);

  return (
    <div className="relative w-[280px]">
      {/* Input part - Command wrapper now includes results logic */}
      <Command className="rounded-lg border border-border bg-card shadow-sm overflow-visible">
        <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
          <CommandInput
            placeholder="Search composers..."
            className="h-9 flex-1 bg-transparent font-serif text-sm placeholder:text-muted-foreground/70 outline-none border-none ring-0 focus:ring-0"
            value={searchQuery}
            onValueChange={handleInputChange}
            autoComplete="off"
            aria-label="Search composers"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-secondary/80 rounded-full text-muted-foreground hover:text-foreground"
              type="button"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>

        {/* Results List - Rendered inside Command, hidden when not open */}
        {/* Added absolute positioning container for floating effect */}
        <div className={`absolute top-[calc(100%+4px)] left-0 right-0 z-50 ${!isOpen ? 'hidden' : ''}`}>
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
