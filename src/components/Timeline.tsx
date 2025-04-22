
import { Era, eras } from '@/data/composers';

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative">
        {/* Timeline line with gradient */}
        <div 
          className="absolute h-0.5 w-full top-1/2 -translate-y-1/2 z-0"
          style={{
            background: 'linear-gradient(to right, #8B6D43, #2D5D7C, #8E4545, #2D5D3D)'
          }}
        />
        
        {/* Timeline nodes */}
        <div className="flex justify-between relative z-10">
          {eras.map((era) => (
            <div 
              key={era.id}
              className="flex flex-col items-center"
              onClick={() => onSelectEra(era.name)}
            >
              <div className="text-center mb-4 cursor-pointer group">
                <p className={`text-base font-medium mb-1 transition-colors duration-300 ${
                  selectedEra === era.name ? 'text-primary font-bold scale-105' : 'text-muted-foreground group-hover:text-primary/80'
                }`}>
                  {era.name}
                </p>
                <p className="text-sm text-muted-foreground">{era.period}</p>
              </div>
              
              <button
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  selectedEra === era.name 
                    ? era.id === 'baroque' ? 'bg-baroque scale-110' :
                      era.id === 'classical' ? 'bg-classical scale-110' :
                      era.id === 'romantic' ? 'bg-romantic scale-110' :
                      'bg-modern scale-110'
                    : 'bg-secondary hover:scale-105'
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
              <div 
                key={era.id}
                className="animate-fade-in"
              >
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
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

