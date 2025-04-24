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
        w-full flex items-center gap-4 p-4
        rounded-2xl cursor-pointer
        transition-all duration-300 ease-out
        transform
        hover:scale-[1.015] hover:bg-primary/5 hover:shadow-md
        ${isSelected
          ? 'bg-primary/10 border border-primary/40 shadow-sm hover:scale-[1.0]'
          : 'border border-transparent'
        }
      `}
      onClick={() => onClick(composer)}
    >
      <img
        src={composer.image}
        alt={composer.name}
        className="w-14 h-14 rounded-full object-cover"
      />
      <div className="min-w-0">
        <h2 className="text-base font-medium text-primary/90 truncate">{composer.name}</h2>
        <p className="text-xs text-muted-foreground">{composer.years}</p>
      </div>
    </div>
  );
}
