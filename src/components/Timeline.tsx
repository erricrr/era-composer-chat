
import { Era, eras } from '@/data/composers';

interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function Timeline({ selectedEra, onSelectEra }: TimelineProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="relative">
        {/* Era labels and info above the timeline */}
        <div className="flex justify-between relative z-10 mb-6">
          {eras.map((era) => (
            <div 
              key={era.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onSelectEra(era.name)}
            >
              <p className={`text-base font-medium mb-1 transition-colors duration-300 ${
                selectedEra === era.name ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-primary/80'
              }`}>
                {era.id === 'modern' ? '20th-21st Century' : era.name}
              </p>
              <p className="text-sm text-muted-foreground">{era.period}</p>
            </div>
          ))}
        </div>
        
        {/* Timeline line with gradient */}
        <div 
          className="absolute h-1 w-full top-1/2 -translate-y-1/2 z-0 rounded-full"
          style={{
            background: 'linear-gradient(to right, #8B6D43, #2D5D7C, #8E4545, #2D5D3D)'
          }}
        />
        
        {/* Timeline nodes */}
        <div className="flex justify-between relative z-10 px-1.5">
          {eras.map((era) => (
            <div 
              key={era.id}
              className="flex flex-col items-center"
            >
              <button
                onClick={() => onSelectEra(era.name)}
                className={`w-4 h-4 rounded-full transition-all duration-300 transform ${
                  selectedEra === era.name 
                    ? era.id === 'baroque' ? 'bg-baroque border-2 border-baroque/30' :
                      era.id === 'classical' ? 'bg-classical border-2 border-classical/30' :
                      era.id === 'romantic' ? 'bg-romantic border-2 border-romantic/30' :
                      'bg-modern border-2 border-modern/30'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                style={{
                  transform: selectedEra === era.name ? 'scale(1.25)' : 'scale(1)'
                }}
                aria-label={`Select ${era.name} era`}
              />
            </div>
          ))}
        </div>

        {/* Era Description */}
        <div className="mt-10 text-center">
          {eras.map((era) => (
            selectedEra === era.name && (
              <div 
                key={era.id}
                className="animate-fade-in"
              >
                <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
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
