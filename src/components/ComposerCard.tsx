import { Composer } from '@/data/composers';

interface ComposerCardProps {
  composer: Composer;
  onClick: (composer: Composer) => void;
  isSelected: boolean;
  compact?: boolean;
}

export function ComposerCard({ composer, onClick, isSelected, compact = false }: ComposerCardProps) {
  return (
    <div
      onClick={() => onClick(composer)}
      className={`
        p-2 rounded-md cursor-pointer select-none transition-transform duration-500 ease-in-out relative group
        ${isSelected
          ? 'bg-background shadow-md border border-primary/10'
          : 'hover:bg-primary/5 border border-transparent hover:shadow-sm hover:border-primary/5 active:bg-primary/10 active:scale-[0.99]'
        }
      `}

    >
      {/* Hover state bar */}
      <div
        className={`
          absolute left-0 top-0.5 bottom-0.5 w-1.5 rounded-r-md bg-primary/20
          transform origin-center transition-all duration-300 ease-out
          opacity-0 scale-y-0
          ${!isSelected && 'group-hover:opacity-100 group-hover:scale-y-100'}
        `}
      />

     {/* Active state bar */}
<div
  className={`
    absolute left-0 top-0.5 bottom-0.5 w-1.5 rounded-r-md bg-primary
    opacity-0 scale-y-0
    ${isSelected && 'opacity-100 scale-y-100'}
  `}
/>


      <div className="flex items-center gap-2 pl-1">
        {/* Composer Image */}
        <div
          className={`rounded-full overflow-hidden bg-muted flex-shrink-0 ${
            compact ? 'w-10 h-10' : 'w-12 h-12'
          }`}
        >
          {composer.imageUrl && (
            <img
              src={composer.imageUrl}
              alt={composer.name}
              className={`
                w-full h-full object-cover
                transition-transform duration-200
                ${isSelected ? 'scale-105' : 'group-hover:scale-105'}
              `}
            />
          )}
        </div>

        {/* Composer Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-medium leading-tight truncate
            transition-colors duration-200
            ${compact ? 'text-sm' : 'text-base'}
            ${isSelected ? 'text-primary' : 'group-hover:text-primary/90'}
          `}>
            {composer.name}
          </h3>
          <p className={`
            text-muted-foreground truncate
            transition-opacity duration-200
            ${compact ? 'text-xs' : 'text-sm'}
            ${isSelected ? 'opacity-90' : 'group-hover:opacity-80'}
          `}>
            {composer.birthYear}-{composer.deathYear || 'present'}
          </p>
        </div>
      </div>
    </div>
  );
}
