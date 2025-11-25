import { Composer } from '@/data/composers';
import { PortraitImage } from './PortraitImage';
interface ComposerCardProps {
  composer: Composer;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  isSelected: boolean;
  compact?: boolean;
  tabIndex?: number;
  role?: string;
  ariaLabel?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}
export function ComposerCard({ composer, onClick, isSelected, compact = false, tabIndex, role, ariaLabel, onKeyDown }: ComposerCardProps) {
  return (
    <div
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={`
        p-4 cursor-pointer select-none transition-transform duration-500 ease-in-out relative group
        focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary
        ${isSelected
          ? 'bg-primary-foreground'
          : 'bg-background hover:bg-primary-foreground/50'
        }
      `}
    >
      {/* Hover state bar */}
      <div
        className={`
          absolute left-0 top-0.5 bottom-0.5 w-1.5 rounded-l-md bg-primary/15
          transform origin-center transition-[opacity,transform] duration-300 ease-out
          opacity-0 scale-y-0
          ${!isSelected && 'group-hover:opacity-100 group-hover:scale-y-100'}
        `}
      />
     {/* Active state bar */}
      <div
        className={`
          absolute left-0 top-0.5 bottom-0.5 w-1.5 rounded-l-md bg-primary
          opacity-0 scale-y-0
          ${isSelected && 'opacity-100 scale-y-100'}
        `}
      />
      <div className="flex items-center gap-4 pl-1">
        {/* Composer Image Container - Now scales on hover */}
        <div
          className={`
            rounded-full overflow-hidden
            ${isSelected ? 'border-2 border-primary' : 'border-2 border-primary/15'}
            flex-shrink-0
            ${compact ? 'w-10 h-10' : 'w-12 h-12'}
            transition-transform duration-200
            ${isSelected ? 'scale-105' : 'group-hover:scale-105'}
          `}
        >
          {composer.imageUrl && (
            <PortraitImage
              composerId={composer.id}
              src={composer.imageUrl}
              alt={composer.name}
              className="" // Removed the scaling from here
            />
          )}
        </div>
        {/* Composer Info */}
        <div className="flex-1 min-w-0">
          <div className={`
            transition-transform duration-200
            ${isSelected ? 'scale-105' : 'group-hover:scale-105'}
          `}>
            <h3 className={`
              font-medium leading-tight truncate
              ${compact ? 'text-sm' : 'text-base'}
              ${isSelected ? 'text-primary' : 'group-hover:text-primary'}
            `}>
              {composer.name}
            </h3>
            <p className={`
              text-muted-foreground truncate
              transition-opacity duration-200
              ${compact ? 'text-xs' : 'text-sm'}
              ${isSelected ? 'opacity-90' : 'group-hover:opacity-90'}
            `}>
              {composer.birthYear}-{composer.deathYear || 'present'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
