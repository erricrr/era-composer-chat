
import { Composer } from '@/data/composers';

interface ComposerCardProps {
  composer: Composer;
  onClick: (composer: Composer) => void;
}

export function ComposerCard({ composer, onClick }: ComposerCardProps) {
  return (
    <div 
      className={`composer-card w-[200px] h-[260px] flex-shrink-0 cursor-pointer bg-card/50 backdrop-blur-sm ${
        composer.era === 'Baroque' ? 'border-baroque/30 hover:border-baroque' :
        composer.era === 'Classical' ? 'border-classical/30 hover:border-classical' : 
        composer.era === 'Romantic' ? 'border-romantic/30 hover:border-romantic' :
        'border-modern/30 hover:border-modern'
      }`}
      onClick={() => onClick(composer)}
    >
      <div className="flex flex-col items-center h-full p-4">
        <img 
          src={composer.image} 
          alt={composer.name} 
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-primary/30"
        />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-center font-serif mb-2 line-clamp-2">{composer.name}</h3>
          <p className="text-sm text-muted-foreground text-center">{composer.years}</p>
          <p className="text-xs text-muted-foreground text-center mt-1">{composer.country}</p>
        </div>
      </div>
    </div>
  );
}
