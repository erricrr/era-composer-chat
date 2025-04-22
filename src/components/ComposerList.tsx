
import { ComposerCard } from './ComposerCard';
import { Composer, Era, getComposersByEra } from '@/data/composers';

interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer) => void;
}

export function ComposerList({ era, onSelectComposer }: ComposerListProps) {
  const composers = getComposersByEra(era);
  
  return (
    <div className="w-full mt-4">
      <h2 className="text-lg font-medium text-center mb-4">
        {era === 'Modern' ? '20th-21st Century' : era} era ({era === 'Modern' ? '1900-Present' : 
                  era === 'Romantic' ? '1820-1900' : 
                  era === 'Classical' ? '1750-1820' : 
                  '1600-1750'})
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {composers.map((composer) => (
          <ComposerCard 
            key={composer.id} 
            composer={composer} 
            onClick={onSelectComposer} 
          />
        ))}
      </div>
    </div>
  );
}
