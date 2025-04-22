import { useState } from 'react';
import { Timeline } from './Timeline';
import { ComposerList } from './ComposerList';
import { Composer, Era } from '@/data/composers';
interface ComposerMenuProps {
  onSelectComposer: (composer: Composer) => void;
  isOpen: boolean;
}
export function ComposerMenu({
  onSelectComposer,
  isOpen
}: ComposerMenuProps) {
  const [selectedEra, setSelectedEra] = useState<Era>(Era.Baroque);
  const getEraText = (era: Era) => {
    return era === Era.Modern ? '20th-21st Century' : era;
  };
  return <div className={`fixed inset-x-0 top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-lg transition-transform duration-500 ease-in-out overflow-hidden ${isOpen ? 'translate-y-0' : '-translate-y-full'}`} style={{
    height: isOpen ? 'auto' : '0',
    maxHeight: '80vh'
  }}>
      <div className="container mx-auto px-4 py-6 flex flex-col">
        <h1 className="text-3xl font-bold text-center font-serif mt-2 mb-4">
          {getEraText(selectedEra)} Composer Conversations
        </h1>
        
        <Timeline selectedEra={selectedEra} onSelectEra={setSelectedEra} />
        
        <div className="px-2 md:px-6 pb-8">
          <ComposerList era={selectedEra} onSelectComposer={onSelectComposer} />
        </div>
        
        <div className="mt-auto text-center text-sm text-muted-foreground pb-4">
          
        </div>
      </div>
    </div>;
}