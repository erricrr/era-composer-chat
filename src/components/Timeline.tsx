
import { Era, eras } from '@/data/composers';

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute h-1 bg-border w-full top-1/2 -translate-y-1/2 z-0" />
        
        {/* Timeline nodes */}
        <div className="flex justify-between relative z-10">
          {eras.map((era) => (
            <div key={era.id} className="flex flex-col items-center">
              <button
                onClick={() => onSelectEra(era.name)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                  selectedEra === era.name 
                    ? era.id === 'baroque' ? 'bg-baroque scale-125 shadow-lg' :
                      era.id === 'classical' ? 'bg-classical scale-125 shadow-lg' :
                      era.id === 'romantic' ? 'bg-romantic scale-125 shadow-lg' :
                      'bg-modern scale-125 shadow-lg'
                    : 'bg-secondary hover:scale-110'
                }`}
                aria-label={`Select ${era.name} era`}
              >
                <span className="text-xs font-bold text-white">
                  {era.name.charAt(0)}
                </span>
              </button>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  selectedEra === era.name ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}>
                  {era.name}
                </p>
                <p className="text-xs text-muted-foreground">{era.period}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected era description */}
      <div className="mt-6 text-center max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground">
          {eras.find(era => era.name === selectedEra)?.description}
        </p>
      </div>
    </div>
  );
}
