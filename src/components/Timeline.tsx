
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
        <div className="flex justify-between mb-2">
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
              <p className="text-xs text-muted-foreground mt-0.5 text-center">
                {era.period}
              </p>
            </div>
          ))}
        </div>
        
        {/* Timeline line with single color gradient */}
        <div className="relative h-1 w-full rounded-full overflow-hidden mt-2">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary rounded-full"
          />
        </div>
        
        {/* Timeline nodes - aligned with text above */}
        <div className="flex justify-between relative -mt-2.5 px-1 mb-6">
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
        <div className="relative mb-10">
          {eras.map((era) => (
            selectedEra === era.name && (
              <div 
                key={era.id} 
                className="absolute w-full transition-all duration-300 ease-in-out"
              >
                {/* Visual connector - positioned to connect to the dot */}
                <div 
                  className="absolute w-0.5 bg-primary/60"
                  style={{
                    left: `calc(${eras.findIndex(e => e.name === era.name) * 25 + 12.5}%)`,
                    height: '1.25rem',
                    top: '-1.25rem'
                  }}
                />
                <p className="text-base text-muted-foreground bg-primary/5 px-6 py-3 rounded-lg italic animate-fade-in">
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
