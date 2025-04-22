
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
              className="flex flex-col items-center cursor-pointer group w-1/4"
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
        
        {/* Timeline line with gradient */}
        <div className="relative h-1 w-full rounded-full overflow-hidden">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(to right, #8B6D43, #2D5D7C, #8E4545, #2D5D3D)'
            }}
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
                    ? era.id === 'baroque' ? 'bg-baroque' :
                      era.id === 'classical' ? 'bg-classical' :
                      era.id === 'romantic' ? 'bg-romantic' :
                      'bg-modern'
                    : 'bg-secondary border border-muted-foreground hover:border-primary/60'
                }`}
                aria-label={`Select ${era.name} era`}
              />
            </div>
          ))}
        </div>

        {/* Era Description */}
        <div className="mt-6 text-center">
          {eras.map((era) => (
            selectedEra === era.name && (
              <p 
                key={era.id}
                className="text-sm text-muted-foreground max-w-3xl mx-auto animate-fade-in italic"
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
