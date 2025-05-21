'use client';
import { useState, useEffect, useRef } from 'react';
import { Era, eras } from '@/data/composers';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsTouch } from '@/hooks/useIsTouch';

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  const localStorageKey = 'timelineOpenPopoverId';
  const isTouch = useIsTouch();
  // Add refs for label buttons and keyboard navigation handler
  const eraLabelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const popoverTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const popoverContentRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number, eraName: Era) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % eras.length;
      eraLabelRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + eras.length) % eras.length;
      eraLabelRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectEra(eraName);
    }
  };

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

  // Function to handle keyboard events on the popover button
  const handlePopoverKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleIconClick(id);
    }
  };

  // Handle tab out of the popover content
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      // If tabbing forward and at the end of the content
      e.preventDefault();
      setOpenPopoverId(null);
      setTimeout(() => {
        popoverTriggerRefs.current[index]?.focus();
      }, 0);
    } else if (e.key === 'Tab' && e.shiftKey) {
      // If tabbing backward from content to trigger
      e.preventDefault();
      setOpenPopoverId(null);
      setTimeout(() => {
        popoverTriggerRefs.current[index]?.focus();
      }, 0);
    }
  };

  // Display label map for era names that need to be shortened/modified
  const displayLabels: Record<string, string> = {
    'Baroque': 'Baroque',
    'Classical': 'Classical',
    'Romantic': 'Romantic',
    '20th Century': '20th Century'
  };

 // helper to render the era icon trigger + tooltip in one place
const renderIcon = (era: typeof eras[number], index: number) => {
  const isSelectedIcon = selectedEra === era.name;
  const baseButtonClasses = 'a11y-touch-target w-11 h-11 rounded-full transition-all duration-300 ease-out relative';
  const iconClass = cn(
    baseButtonClasses,
    isSelectedIcon
      ? 'bg-background border-2 border-primary text-primary shadow-sm shadow-primary/20'
      : 'bg-background border border-primary/60 text-primary/70 hover:border-primary hover:text-primary hover:scale-105 transition-transform'
  );
  const button = (
    <button
      ref={el => popoverTriggerRefs.current[index] = el}
      onClick={e => { e.stopPropagation(); handleIconClick(era.id); }}
      onKeyDown={e => handlePopoverKeyDown(e, era.id)}
      className={iconClass}
      aria-label={`More info about ${era.name} era`}
      aria-expanded={openPopoverId === era.id}
      aria-pressed={isSelectedIcon}
    >
      <span className="text-xs font-medium">?</span>
    </button>
  );
  const trigger = <PopoverTrigger asChild>{button}</PopoverTrigger>;
  if (isTouch) {
    return trigger;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {isSelectedIcon ? 'Active Era' : 'Era Details'}
      </TooltipContent>
    </Tooltip>
  );
};

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto my-4 md:my-6">
        {/* Era Timeline */}
        <div className="relative flex flex-col">
          {/* Era labels */}
          <div className="flex justify-between mb-2" role="tablist">
            {eras.map((era, index) => {
              const displayLabel = displayLabels[era.name] || era.name;

              return (
                <button
                  key={era.id}
                  ref={el => eraLabelRefs.current[index] = el}
                  type="button"
                  role="tab"
                  aria-selected={selectedEra === era.name}
                  onClick={() => onSelectEra(era.name)}
                  onKeyDown={e => handleLabelKeyDown(e, index, era.name)}
                  className="flex flex-col items-center w-1/4 group p-0 m-0 bg-transparent border-none appearance-none"
                >
                  <div className="relative flex flex-col items-center">
                    {/* Era name */}
                    <h3 className={`
                      text-center transition-all duration-300 ease-out whitespace-nowrap
                      font-semibold text-base lg:text-lg
                      ${selectedEra === era.name
                        ? 'text-primary font-bold scale-[1.02]'
                        : 'text-muted-foreground group-hover:text-primary/80 group-hover:scale-[1.02]'
                      }
                    `}>
                      {displayLabel}
                    </h3>

                    {/* Period years */}
                    <p className={`
                      text-xs sm:text-sm text-muted-foreground mt-1 text-center whitespace-nowrap
                      font-medium transition-all duration-300 ease-out
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
                </button>
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
              {eras.map((era, index) => (
                <div
                  key={era.id}
                  className="flex flex-col items-center w-1/4 relative z-10"
                >
                  <Popover
                    open={openPopoverId === era.id}
                    onOpenChange={(open) => {
                      setOpenPopoverId(open ? era.id : null);
                      if (!open) {
                        // When closing, focus the trigger button that opened the popover
                        setTimeout(() => {
                          popoverTriggerRefs.current[index]?.focus();
                        }, 0);
                      }
                    }}
                  >
                    {renderIcon(era, index)}
                    <PopoverContent
                      ref={el => popoverContentRefs.current[index] = el}
                      className="relative max-w-sm p-2 shadow-xl overflow-hidden focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-opacity-75"
                      onEscapeKeyDown={() => {
                        setOpenPopoverId(null);
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => handleContentKeyDown(e, index)}
                    >
                      <div
                        className="p-3"
                        role="dialog"
                        aria-labelledby={`era-title-${era.id}`}
                        aria-modal="true"
                      >
                        <h4 id={`era-title-${era.id}`} className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 text-primary">{era.name}</h4>
                        <p className="text-sm xs:text-base sm:text-lg text-muted-foreground">{era.description}</p>
                        </div>
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-md animate-[expandVertical_0.3s_ease-in-out] origin-top" />
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
