
import { Era, eras } from '@/data/composers';

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {/* Era Timeline */}
      <div className="relative">
        {/* Era labels with period */}
        <div className="flex justify-between mb-4">
          {eras.map((era) => (
            <div 
              key={era.id}
              className="flex flex-col items-center w-1/4 group cursor-pointer"
              onClick={() => onSelectEra(era.name)}
            >
              <h3 className={`text-base font-medium text-center transition-colors ${
                selectedEra === era.name ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}>
                {era.id === 'modern' ? '20th-21st Century' : era.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {era.period}
              </p>
            </div>
          ))}
        </div>
        
        {/* Timeline line with single color gradient */}
        <div className="relative h-1 w-full rounded-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary rounded-full"
          />
        </div>
        
        {/* Timeline nodes - aligned with text above */}
        <div className="flex justify-between relative -mt-2.5 px-1">
          {eras.map((era) => (
            <div 
              key={era.id} 
              className="flex flex-col items-center w-1/4"
              onClick={() => onSelectEra(era.name)}
            >
              <button
                className={`w-4 h-4 rounded-full transition-all duration-300 group-hover:scale-125 ${
                  selectedEra === era.name 
                    ? 'bg-primary scale-125'
                    : 'bg-secondary border border-muted-foreground hover:border-primary/60'
                }`}
                aria-label={`Select ${era.name} era`}
              />
            </div>
          ))}
        </div>

        {/* Era Description with correctly aligned connector */}
        <div className="mt-8 relative h-[120px] w-full">
          {eras.map((era, index) => (
            selectedEra === era.name && (
              <div 
                key={era.id} 
                className="absolute transition-all duration-300 ease-in-out"
                style={{
                  left: `${index * 25}%`,
                  width: '25%'
                }}
              >
                {/* Visual connector - properly centered with the era */}
                <div className="absolute left-1/2 -top-4 -translate-x-1/2 w-0.5 h-4 bg-primary/60" />
                <p className="text-base text-muted-foreground bg-primary/5 mx-auto px-4 py-2 rounded-lg italic animate-fade-in text-center">
                  {era.description}
                </p>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
