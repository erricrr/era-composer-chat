'use client';
import { useState } from 'react';
import { Era, eras } from '@/data/composers';
import { InfoIcon } from 'lucide-react'; // lightweight, beautiful icon
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // assumes shadcn/ui popover
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // reusable tooltip

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const handleIconClick = (id: string) => {
    setOpenPopoverId(openPopoverId === id ? null : id);
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto my-6">
        {/* Era Timeline */}
        <div className="relative flex flex-col">

          {/* Era labels */}
          <div className="flex justify-between mb-2">
            {eras.map(era => (
              <div
                key={era.id}
                className="flex flex-col items-center w-1/4 group cursor-pointer"
                onClick={() => onSelectEra(era.name)}
              >
                <div className="relative">
                  <h3 className={`text-lg mb-1 md:text-xl text-center transition-all duration-300 ease-out
                    ${selectedEra === era.name
                      ? 'text-primary scale-[1.02]'
                      : 'text-muted-foreground group-hover:text-primary/80 group-hover:scale-[1.02]'}`}
                  >
                    {era.name}
                  </h3>

                  {/* Hover underline */}
                  <div className={`absolute -bottom-1 left-2 right-2 h-1.5 rounded-b-md bg-primary/15
                    transform origin-left transition-all duration-300 ease-out
                    scale-x-0
                    ${selectedEra !== era.name && 'group-hover:scale-x-100'}
                  `}
                  />

                  {/* Active underline */}
                  <div className={`absolute -bottom-1 left-2 right-2 h-1.5 rounded-b-md bg-primary
                    transform origin-left transition-all duration-300 ease-out
                    ${selectedEra === era.name ? 'scale-x-100' : 'scale-x-0'}
                  `}
                  />
                </div>

                <p className={`text-sm text-muted-foreground mt-2 text-center
                  transition-all duration-300 ease-out
                  ${selectedEra === era.name
                    ? 'opacity-100 scale-[1.02]'
                    : 'opacity-70 group-hover:opacity-100 group-hover:scale-[1.02]'}`}
                >
                  ({era.period})
                </p>
              </div>
            ))}
          </div>

          {/* Timeline container */}
          <div className="relative h-4">
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIconClick(era.id);
                            }}
                            className={`w-8 h-8 rounded-full bg-background border-[2px] flex items-center justify-center
                              transition-all duration-300 ease-out
                              ${selectedEra === era.name
                                ? 'border-primary animate-pulse-once shadow-md shadow-primary/20 scale-110'
                                : 'border-primary/60 hover:border-primary hover:shadow-md hover:scale-105'
                              }`}
                            aria-label={`More info about ${era.name}`}
                          >
                            <InfoIcon className="w-4 h-4 text-primary" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Click for Era Info
                      </TooltipContent>
                    </Tooltip>

                    <PopoverContent className="max-w-sm p-4 shadow-xl rounded-lg">
                      <h4 className="text-lg font-semibold mb-2 text-primary">{era.name}</h4>
                      <p className="text-sm text-muted-foreground">{era.description}</p>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </div>

          {/* Selected era description inline */}
          <div className="w-full mt-4">
            {eras.map(era => selectedEra === era.name && (
              <div
                key={era.id}
                className="w-full transition-all duration-300 ease-out animate-fade-in"
              >
                <div className="mx-auto max-w-4xl">
                  <p className="text-sm py-0 text-center italic text-primary">
                    {era.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}
