'use client';
import { useState, useEffect } from 'react';
import { Era, eras } from '@/data/composers';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsTouch } from '@/hooks/useIsTouch';

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  const localStorageKey = 'timelineOpenPopoverId';
  const isTouch = useIsTouch();

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(() => {
    // Only run in client-side
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      return storedValue && storedValue !== 'null' ? JSON.parse(storedValue) : null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(localStorageKey, openPopoverId ? JSON.stringify(openPopoverId) : 'null');
  }, [openPopoverId]);

  const handleIconClick = (id: string) => {
    setOpenPopoverId(openPopoverId === id ? null : id);
  };

  // Display label map for era names that need to be shortened/modified
  const displayLabels: Record<string, string> = {
    'Baroque': 'Baroque',
    'Classical': 'Classical',
    'Romantic': 'Romantic',
    '20th-21st Century': '20th-21st Century'
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto my-4 md:my-6">
        {/* Era Timeline */}
        <div className="relative flex flex-col">
          {/* Era labels */}
          <div className="flex justify-between mb-2">
            {eras.map(era => {
              const displayLabel = displayLabels[era.name] || era.name;

              return (
                <div
                  key={era.id}
                  className="flex flex-col items-center w-1/4 group cursor-pointer"
                  onClick={() => onSelectEra(era.name)}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Era name */}
                    <h3 className={`
                      text-center transition-all duration-300 ease-out whitespace-nowrap
                      text-base sm:text-lg md:text-xl
                      ${selectedEra === era.name
                        ? 'text-primary font-medium scale-[1.02]'
                        : 'text-muted-foreground group-hover:text-primary/80 group-hover:scale-[1.02]'
                      }
                    `}>
                      {displayLabel}
                    </h3>

                    {/* Period years */}
                    <p className={`
                      text-xs sm:text-sm text-muted-foreground mt-1 text-center whitespace-nowrap
                      transition-all duration-300 ease-out
                      ${selectedEra === era.name
                        ? 'opacity-100 scale-[1.02]'
                        : 'opacity-70 group-hover:opacity-100 group-hover:scale-[1.02]'
                      }
                    `}>
                      ({era.period})
                    </p>

                   {/* Hover underline */}
                   <div className={`
                      absolute -bottom-1.5 left-0 right-0 h-1.5 rounded-b-md bg-primary/15
                      transform origin-left transition-all duration-300 ease-out
                      scale-x-0 w-full
                      ${selectedEra !== era.name && 'group-hover:scale-x-100'}
                    `} />

                    {/* Active underline */}
                    <div className={`
                      absolute -bottom-1.5 left-0 right-0 h-1.5 rounded-b-md bg-primary
                      ${selectedEra === era.name ? 'scale-x-100' : 'scale-x-0'}
                    `} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline container */}
          <div className="relative h-4 mt-2">
            {/* Timeline line */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full">
              <div className="h-[2px] w-full bg-gradient-to-r from-primary/30 to-primary" />
            </div>

            {/* Timeline icons */}
            <div className="flex justify-between relative px-1 h-full">
              {eras.map(era => (
                <div
                  key={era.id}
                  className="flex flex-col items-center w-1/4 relative z-10"
                >
                  <Popover open={openPopoverId === era.id} onOpenChange={(open) => setOpenPopoverId(open ? era.id : null)}>
                    {!isTouch ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIconClick(era.id);
                              }}
                              className={`
                                w-6 h-6 rounded-full flex items-center justify-center
                                transition-all duration-300 ease-out relative
                                ${selectedEra === era.name
                                  ? 'bg-primary text-background shadow-md shadow-primary/30'
                                  : 'bg-background border border-primary/60 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/10'
                                }
                                before:absolute before:w-8 before:h-8 before:bg-background before:-z-10 before:rounded-full
                              `}
                              aria-label={`More info about ${era.name}`}
                            >
                              <span className="text-xs font-medium">?</span>
                            </button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {selectedEra === era.name ? 'Active Era' : 'Era Details'}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <PopoverTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIconClick(era.id);
                          }}
                          className={`
                            w-6 h-6 rounded-full flex items-center justify-center
                            transition-all duration-300 ease-out relative
                            ${selectedEra === era.name
                              ? 'bg-primary text-background shadow-md shadow-primary/30'
                              : 'bg-background border border-primary/60 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/10'
                            }
                            before:absolute before:w-8 before:h-8 before:bg-background before:-z-10 before:rounded-full
                          `}
                          aria-label={`More info about ${era.name}`}
                        >
                          <span className="text-xs font-medium">?</span>
                        </button>
                      </PopoverTrigger>
                    )}

                    <PopoverContent className="relative max-w-sm p-2 shadow-xl overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-md animate-[expandVertical_0.3s_ease-in-out] origin-top" />
                      <div className="p-3">
                        <h4 className="text-lg font-semibold mb-2 text-primary">{era.name}</h4>
                        <p className="text-sm text-muted-foreground">{era.description}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
