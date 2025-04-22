
import { Era, eras } from '@/data/composers';

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <div className="relative">
        {/* Era labels with period */}
        <div className="flex justify-between mb-8">
          {eras.map((era) => (
            <div 
              key={era.id}
              className="flex flex-col items-center cursor-pointer group w-1/4"
              onClick={() => onSelectEra(era.name)}
            >
              <h3 className={`text-base font-medium text-center transition-colors duration-200 ${
                selectedEra === era.name 
                  ? 'text-primary font-semibold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                {era.id === 'modern' ? '20th-21st Century' : era.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 text-center font-medium">
                {era.period}
              </p>
            </div>
          ))}
        </div>
        
        {/* Timeline line */}
        <div className="relative h-[2px] w-full bg-border">
          <div className="absolute inset-0">
            <div className="h-full w-full bg-gradient-to-r from-baroque via-classical to-modern opacity-60" />
          </div>
        </div>
        
        {/* Timeline nodes */}
        <div className="flex justify-between absolute left-0 right-0 -top-[5px]">
          {eras.map((era) => (
            <div key={era.id} className="flex items-center justify-center">
              <button
                onClick={() => onSelectEra(era.name)}
                className={`w-3 h-3 rounded-full transition-all duration-300 relative
                  ${selectedEra === era.name ? 'scale-150' : 'hover:scale-125'}
                  ${era.id === 'baroque' ? 'bg-baroque' :
                    era.id === 'classical' ? 'bg-classical' :
                    era.id === 'romantic' ? 'bg-romantic' :
                    'bg-modern'
                  }`}
                aria-label={`Select ${era.name} era`}
              />
            </div>
          ))}
        </div>

        {/* Era Description */}
        <div className="mt-8 text-center">
          {eras.map((era) => (
            selectedEra === era.name && (
              <p 
                key={era.id}
                className="text-sm text-muted-foreground max-w-2xl mx-auto animate-fade-in font-medium"
              >
                {era.description}
              </p>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
