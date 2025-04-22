
import { Composer } from '@/data/composers';

interface ComposerCardProps {
  composer: Composer;
  onClick: (composer: Composer) => void;
}

export function ComposerCard({ composer, onClick }: ComposerCardProps) {
  return (
    <div 
      className="flex flex-col items-center p-2 cursor-pointer group transition-all duration-300 hover:scale-105"
      onClick={() => onClick(composer)}
    >
      <div className={`relative w-14 h-14 mb-1 rounded-full overflow-hidden border-2 ${
        composer.era === 'Baroque' ? 'border-baroque/60' :
        composer.era === 'Classical' ? 'border-classical/60' : 
        composer.era === 'Romantic' ? 'border-romantic/60' :
        'border-modern/60'
      }`}>
        <img 
          src={composer.image} 
          alt={composer.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xs font-medium text-center group-hover:text-primary transition-colors line-clamp-1">
        {composer.name}
      </h3>
      <p className="text-[10px] text-muted-foreground text-center">{composer.years}</p>
    </div>
  );
}
