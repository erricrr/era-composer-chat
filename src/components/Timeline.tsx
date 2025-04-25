import { Era, eras } from '@/data/composers';
interface TimelineProps {
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}
export function Timeline({
  selectedEra,
  onSelectEra
}: TimelineProps) {
  return <div className="w-full max-w-4xl mx-auto my-6">
      {/* Era Timeline */}
      <div className="relative flex flex-col">
       {/* Era labels with period */}
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
          {era.id === 'modern' ? '20th-21st Century' : era.name}
        </h3>
        {/* Hover state underline */}
        <div className={`absolute -bottom-1 left-2 right-2 h-1.5 rounded-b-md bg-primary/15
          transform origin-left transition-all duration-300 ease-out
          scale-x-0
          ${selectedEra !== era.name && 'group-hover:scale-x-100'}
        `}
        />
        {/* Active state underline */}
        <div className={`absolute -bottom-1 left-2 right-2 h-1.5 rounded-b-md bg-primary
          transform origin-left transition-all duration-300 ease-out
          scale-x-0
          ${selectedEra === era.name && 'scale-x-100'}
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

        {/* Timeline container for better alignment */}
        <div className="relative h-4">
          {/* Timeline line with single color gradient */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full">
            <div className="h-[2px] w-full bg-gradient-to-r from-primary/30 to-primary" />
          </div>

          {/* Timeline nodes - aligned with text above */}
          <div className="flex justify-between relative px-1 h-full">
            {eras.map(era => (
            <div
            key={era.id}
            className="flex flex-col items-center w-1/4 relative z-10"
            onClick={() => onSelectEra(era.name)}
          >
            <button
            className={`w-4 h-4 rounded-full relative top-1/2 -translate-y-1/2
              transition-all duration-300 ease-out
              ${selectedEra === era.name
                ? 'bg-background border-[3px] border-primary shadow-lg shadow-primary/20 scale-110 z-10'
                : 'bg-background border-2 border-primary/60 hover:border-primary hover:shadow-md hover:shadow-primary/10 hover:scale-105 z-10'
              }`}
            aria-label={`Select ${era.name} era`}
          />
          </div>
            ))}
          </div>
        </div>

        {/* Era Description */}
        <div className="w-full mt-2">
          {eras.map(era => selectedEra === era.name && (
            <div
              key={era.id}
              className="w-full transition-all duration-300 ease-out animate-fade-in"
            >
              <div className="mx-auto max-w-4xl">
                <p className={`text-sm py-0 text-center italic
                  ${selectedEra === era.name ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {era.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>;
}
