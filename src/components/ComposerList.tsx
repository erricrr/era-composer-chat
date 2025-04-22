import { ComposerCard } from './ComposerCard';
import { Composer, Era, getComposersByEra } from '@/data/composers';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer) => void;
}
export function ComposerList({
  era,
  onSelectComposer
}: ComposerListProps) {
  const composers = getComposersByEra(era);
  return <div className="w-full mt-4 my-[20px]">
      <h2 className="text-lg font-medium text-center mb-4">
        {era === 'Modern' ? '20th-21st Century' : era} era ({era === 'Modern' ? '1900-Present' : era === 'Romantic' ? '1820-1900' : era === 'Classical' ? '1750-1820' : '1600-1750'})
      </h2>
      <ScrollArea className="w-full bg-card dark:bg-sidebar/40 rounded-lg p-4 px-[15px] py-[5px]">
        <div className="flex space-x-4 pb-4">
          {composers.map(composer => <ComposerCard key={composer.id} composer={composer} onClick={onSelectComposer} />)}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>;
}