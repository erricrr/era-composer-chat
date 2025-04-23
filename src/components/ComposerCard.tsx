import { Composer } from '@/data/composers';

interface ComposerCardProps {
  composer: Composer;
  onClick: (composer: Composer) => void;
  isSelected?: boolean;
}

export function ComposerCard({ composer, onClick, isSelected }: ComposerCardProps) {
  return (
    <div
      className={`
        flex-shrink-0 cursor-pointer group
        relative overflow-hidden
        transition-all duration-300 ease-out
        hover:scale-[1.02]
        before:absolute before:inset-0
        before:bg-primary/0 hover:before:bg-primary/10
        before:transition-colors before:duration-300
        ${isSelected ? 'scale-[1.02] before:bg-primary/15' : ''}
      `}
      onClick={() => onClick(composer)}
    >
      <div className="flex flex-col lg:flex-row lg:items-center p-2 relative z-10">
        <div className={`
          relative w-14 h-14 mx-auto lg:mx-0 rounded-full overflow-hidden
          border-2 transition-all duration-300
          group-hover:shadow-[0_0_15px_rgba(var(--primary)_/_0.2)]
          ${isSelected ?
            'border-primary shadow-[0_0_20px_rgba(var(--primary)_/_0.3)]' :
            'border-primary/60 group-hover:border-primary'
          }
        `}>
          <img
            src={composer.image}
            alt={composer.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col items-center lg:items-start lg:ml-4 mt-1 lg:mt-0">
          <h3 className={`
            text-base font-medium text-center lg:text-left
            transition-all duration-300
            group-hover:text-primary group-hover:translate-x-0.5
            ${isSelected ? 'text-primary translate-x-0.5' : ''}
          `}>
            {composer.name}
          </h3>
          <p className="text-xs text-muted-foreground text-center lg:text-left transition-opacity duration-300 group-hover:opacity-90">
            {composer.years}
          </p>
        </div>
      </div>
    </div>
  );
}
