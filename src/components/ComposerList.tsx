
import { ComposerCard } from './ComposerCard';
import { Composer, Era, getComposersByEra } from '@/data/composers';
import { ScrollArea } from './ui/scroll-area';

interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer) => void;
}

export function ComposerList({ era, onSelectComposer }: ComposerListProps) {
  const composers = getComposersByEra(era);

  return (
    <div className="w-full py-6">
      <ScrollArea className="w-full">
        <div className="flex gap-6 px-4 pb-4">
          {composers.map((composer) => (
            <div key={composer.id} className="flex-none">
              <ComposerCard composer={composer} onClick={onSelectComposer} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
