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
      w-full flex items-center gap-4 p-4 pl-3 rounded-2xl cursor-pointer select-none
      transition-all duration-300 ease-out transform relative group

      ${isSelected
        ? 'bg-background shadow-md [&_h2]:text-primary [&_p]:opacity-90'
        : 'hover:bg-background/50 hover:shadow-sm'}
    `}
    onClick={() => onClick(composer)}
  >
    {/* Left selection bar */}
    {isSelected && (
      <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-md bg-primary transition-all duration-300 ease-out" />
    )}

    {/* Composer image */}
    <img
      src={composer.image}
      alt={composer.name}
      className={`
        w-14 h-14 rounded-full object-cover flex-shrink-0 border-2
        transition-transform duration-300 ease-out
        ${isSelected ? 'border-primary scale-105' : 'border-white/10 group-hover:scale-105 group-hover:border-primary'}
      `}
    />

    {/* Text block */}
    <div className="min-w-0">
      <h2 className={`
        text-base font-medium text-primary/90 transition-transform duration-300 ease-out
        ${isSelected ? 'text-primary scale-[1.02]' : 'group-hover:text-primary group-hover:scale-[1.02]'}
      `}>
        {composer.name}
      </h2>
      <p className={`
        text-xs text-muted-foreground transition-all duration-300 ease-out
        ${isSelected ? 'scale-[1.02]' : 'group-hover:scale-[1.02]'}
      `}>
        {composer.years}
      </p>
    </div>
  </div>
  );
}
