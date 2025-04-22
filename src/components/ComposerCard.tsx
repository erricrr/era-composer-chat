
import { Composer } from '@/data/composers';

interface ComposerCardProps {
  composer: Composer;
  onClick: (composer: Composer) => void;
  isSelected?: boolean;
}

export function ComposerCard({ composer, onClick, isSelected }: ComposerCardProps) {
  return (
    <div 
      className={`flex-shrink-0 lg:w-full lg:flex lg:items-center lg:space-x-4 flex flex-col items-center p-2 cursor-pointer group transition-all duration-300 hover:scale-105 ${
        isSelected ? 'scale-105' : ''
      }`}
      onClick={() => onClick(composer)}
    >
      <div className={`relative w-14 h-14 mb-1 lg:mb-0 rounded-full overflow-hidden border-2 ${
        isSelected ? 'border-primary' : 'border-primary/60'
      }`}>
        <img 
          src={composer.image} 
          alt={composer.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col items-center lg:items-start lg:ml-4">
        <h3 className={`text-sm font-medium text-center lg:text-left group-hover:text-primary transition-colors line-clamp-1 ${
          isSelected ? 'text-primary' : ''
        }`}>
          {composer.name}
        </h3>
        <p className="text-xs text-muted-foreground text-center lg:text-left">{composer.years}</p>
      </div>
    </div>
  );
}
