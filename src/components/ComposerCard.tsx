
import { Composer } from '@/data/composers';

interface ComposerCardProps {
  composer: Composer;
  onClick: (composer: Composer) => void;
}

export function ComposerCard({ composer, onClick }: ComposerCardProps) {
  return (
    <div 
      className={`composer-card min-w-[180px] w-[180px] mx-2 cursor-pointer border-2 ${
        composer.era === 'Baroque' ? 'border-baroque/30 hover:border-baroque' :
        composer.era === 'Classical' ? 'border-classical/30 hover:border-classical' : 
        composer.era === 'Romantic' ? 'border-romantic/30 hover:border-romantic' :
        'border-modern/30 hover:border-modern'
      }`}
      onClick={() => onClick(composer)}
    >
      <img 
        src={composer.image} 
        alt={composer.name} 
        className="composer-image hover:scale-105 transition-transform"
      />
      <h3 className="text-lg font-bold text-center font-serif">{composer.name}</h3>
      <p className="text-sm text-muted-foreground text-center">{composer.years}</p>
      <p className="text-xs text-muted-foreground text-center mt-1">{composer.country}</p>
    </div>
  );
}
