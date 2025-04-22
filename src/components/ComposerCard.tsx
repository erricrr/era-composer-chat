
import { Composer } from '@/data/composers';

interface ComposerCardProps {
  composer: Composer;
  onClick: (composer: Composer) => void;
}

export function ComposerCard({ composer, onClick }: ComposerCardProps) {
  return (
    <div 
      className={`composer-card w-[180px] h-[240px] flex-none mx-2 cursor-pointer border-2 ${
        composer.era === 'Baroque' ? 'border-baroque/30 hover:border-baroque' :
        composer.era === 'Classical' ? 'border-classical/30 hover:border-classical' : 
        composer.era === 'Romantic' ? 'border-romantic/30 hover:border-romantic' :
        'border-modern/30 hover:border-modern'
      }`}
      onClick={() => onClick(composer)}
    >
      <div className="flex flex-col items-center h-full">
        <img 
          src={composer.image} 
          alt={composer.name} 
          className="w-24 h-24 rounded-full object-cover mx-auto mt-4 border-2 border-primary/30"
        />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-bold text-center font-serif line-clamp-2">{composer.name}</h3>
          <p className="text-sm text-muted-foreground text-center">{composer.years}</p>
          <p className="text-xs text-muted-foreground text-center mt-1">{composer.country}</p>
        </div>
      </div>
    </div>
  );
}
