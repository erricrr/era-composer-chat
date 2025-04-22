
import { Composer } from '@/data/composers';

interface ComposerCardProps {
  composer: Composer;
  onClick: (composer: Composer) => void;
  isSelected?: boolean;
}

export function ComposerCard({ composer, onClick, isSelected = false }: ComposerCardProps) {
  const handleClick = () => {
    onClick(composer);
  };

  return (
    <div 
      className={`flex flex-col items-center w-40 min-w-40 p-3 rounded-lg cursor-pointer transition-colors
        ${isSelected 
          ? 'bg-primary/20 ring-2 ring-primary/50' 
          : 'hover:bg-card/80 hover:shadow-md'
        }`}
      onClick={handleClick}
    >
      <div className="w-24 h-24 rounded-full overflow-hidden mb-2 shadow-md">
        <img 
          src={composer.image} 
          alt={composer.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-serif text-center font-medium">{composer.name}</h3>
      <p className="text-xs text-center text-muted-foreground">{composer.years}</p>
    </div>
  );
}
