
import { Era, eras } from '@/data/composers';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  return (
    <div className="w-full max-w-xl mx-auto py-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute h-0.5 bg-border w-full top-1/2 -translate-y-1/2 z-0" />
        
        {/* Timeline nodes */}
        <div className="flex justify-between relative z-10">
          {eras.map((era) => (
            <HoverCard key={era.id}>
              <HoverCardTrigger>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => onSelectEra(era.name)}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedEra === era.name 
                        ? era.id === 'baroque' ? 'bg-baroque scale-125' :
                          era.id === 'classical' ? 'bg-classical scale-125' :
                          era.id === 'romantic' ? 'bg-romantic scale-125' :
                          'bg-modern scale-125'
                        : 'bg-secondary hover:scale-110'
                    }`}
                    aria-label={`Select ${era.name} era`}
                  />
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium transition-colors duration-300 ${
                      selectedEra === era.name ? 'text-primary font-bold' : 'text-muted-foreground'
                    }`}>
                      {era.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{era.period}</p>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-4">
                <p className="text-sm">{era.description}</p>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </div>
  );
}
