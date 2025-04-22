
import { ComposerCard } from './ComposerCard';
import { Composer, Era, getComposersByEra } from '@/data/composers';

interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer) => void;
}

export function ComposerList({ era, onSelectComposer }: ComposerListProps) {
  const composers = getComposersByEra(era);

  return (
    <div className="w-full py-6">
      <div className="flex overflow-x-auto pb-4 scrollbar-none snap-x">
        <div className="flex space-x-6 px-4 snap-mandatory pl-[max(1rem,(100%-900px)/2)]">
          {composers.map((composer) => (
            <div key={composer.id} className="snap-center">
              <ComposerCard composer={composer} onClick={onSelectComposer} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
