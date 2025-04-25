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
        w-full flex items-center gap-3 p-4 rounded-lg cursor-pointer select-none
        transition-all duration-300 ease-out transform relative group
        ${isSelected
          ? 'bg-background shadow-md [&_h2]:text-primary [&_p]:opacity-90'
          : 'hover:bg-background/50 hover:shadow-sm'}
      `}
      onClick={() => onClick(composer)}
    >
      {/* Hover state bar - adjusted width from w-2 to w-1.5 */}
      <div
        className={`
          absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r-md bg-primary/15
          transform origin-center transition-all duration-300 ease-out
          opacity-0 scale-y-0
          ${!isSelected && 'group-hover:opacity-100 group-hover:scale-y-100'}
        `}
      />

      {/* Active state bar */}
      <div
        className={`
          absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r-md bg-primary
          transform origin-center transition-all duration-300 ease-out
          opacity-0 scale-y-0
          ${isSelected && 'opacity-100 scale-y-100'}
        `}
      />

      {/* Composer image */}
      <img
        src={composer.image}
        alt={composer.name}
        className={`
          w-11 h-11 rounded-full object-cover flex-shrink-0 border-2
          transition-transform duration-300 ease-out
          ${isSelected ? 'border-primary scale-105' : 'border-white/10 group-hover:scale-105 group-hover:border-primary/80'}
        `}
      />

      {/* Text block */}
      <div className="min-w-0">
        <h2 className={`
          text-base font-medium text-primary/90 transition-transform duration-300 ease-out truncate
          ${isSelected ? 'text-primary scale-[1.02]' : 'group-hover:text-primary group-hover:scale-[1.02]'}
        `}>
          {composer.name}
        </h2>
        <p className={`
          text-xs text-muted-foreground transition-all duration-300 ease-out truncate
          ${isSelected ? 'scale-[1.02]' : 'group-hover:scale-[1.02]'}
        `}>
          {composer.years}
        </p>
      </div>
    </div>
  );
}
