import { Composer } from '@/data/composers';
import { PortraitImage } from './PortraitImage';
import { memo } from 'react';

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

export const ComposerCard = memo(function ComposerCard({ composer, onClick, isSelected, compact = false, tabIndex, role, ariaLabel, onKeyDown }: ComposerCardProps) {
  return (
    <div
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={`
        p-3 cursor-pointer select-none transition-colors duration-150 relative group overflow-hidden
        focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary
        ${isSelected
          ? 'bg-primary-foreground'
          : 'bg-background hover:bg-primary-foreground/50'
        }
      `}
      style={{ contain: 'layout paint style' }}
    >
      {/* Hover state bar */}
      <div
        className={`
          absolute left-0 top-0.5 bottom-0.5 w-1.5 rounded-l-md bg-primary/15
          transition-opacity duration-150
          opacity-0
          ${!isSelected && 'group-hover:opacity-100'}
        `}
      />
     {/* Active state bar */}
      <div
        className={`
          absolute left-0 top-0.5 bottom-0.5 w-1.5 rounded-l-md bg-primary
          ${isSelected ? 'opacity-100' : 'opacity-0'}
        `}
      />
      <div className="flex items-center gap-3 pl-1">
        {/* Composer Image Container */}
        <div
          className={`
            rounded-full overflow-hidden
            ${isSelected ? 'border-2 border-primary' : 'border-2 border-primary/15'}
            flex-shrink-0
            ${compact ? 'w-10 h-10' : 'w-12 h-12'}
            transition-transform duration-150
            ${isSelected ? 'scale-105' : 'group-hover:scale-105'}
          `}
        >
          {composer.imageUrl && (
            <PortraitImage
              composerId={composer.id}
              src={composer.imageUrl}
              alt={composer.name}
              className=""
            />
          )}
        </div>
        {/* Composer Info */}
        <div className="flex-1 min-w-0 w-0">
          <div>
            <h3 className={`
              font-medium leading-tight truncate max-w-full
              ${compact ? 'text-sm' : 'text-base'}
              ${isSelected ? 'text-primary' : 'group-hover:text-primary'}
              transition-all duration-150
              ${isSelected ? '' : 'group-hover:scale-[1.02]'}
            `}>
              {composer.name}
            </h3>
            <p className={`
              text-muted-foreground truncate
              ${compact ? 'text-xs' : 'text-sm'}
              ${isSelected ? 'opacity-90' : 'group-hover:opacity-90'}
              transition-opacity duration-150
            `}>
              {composer.birthYear}-{composer.deathYear || 'present'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
