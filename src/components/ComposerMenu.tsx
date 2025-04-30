import { useState, useEffect, useCallback } from 'react';
import { Timeline } from './Timeline';
import { ComposerList } from './ComposerList';
import { Composer, Era, getComposersByEra } from '@/data/composers';

interface ComposerMenuProps {
  onSelectComposer: (composer: Composer) => void;
  onStartChat: (composer: Composer) => void;
  selectedComposer: Composer | null;
  isOpen: boolean;
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
}

export function ComposerMenu({
  onSelectComposer,
  onStartChat,
  selectedComposer,
  isOpen,
  selectedEra,
  onSelectEra
}: ComposerMenuProps) {
  // State to remember the last selected composer for each era
  const [lastSelectedComposerPerEra, setLastSelectedComposerPerEra] = useState<Partial<Record<Era, Composer>>>({});

  // Update the last selected composer for the current era whenever selectedComposer changes
  useEffect(() => {
    if (selectedComposer) {
      setLastSelectedComposerPerEra(prevMap => ({
        ...prevMap,
        [selectedEra]: selectedComposer
      }));
    }
  }, [selectedComposer, selectedEra]);

  // Handle era changes
  const handleEraChange = useCallback((newEra: Era) => {
    onSelectEra(newEra);

    const rememberedComposer = lastSelectedComposerPerEra[newEra];
    if (rememberedComposer) {
      onSelectComposer(rememberedComposer);
    } else {
      const composersInEra = getComposersByEra(newEra);
      if (composersInEra.length > 0) {
        onSelectComposer(composersInEra[0]);
      }
    }
  }, [onSelectEra, lastSelectedComposerPerEra, onSelectComposer]);

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col h-full overflow-y-auto">
      <div className="relative">
        <h1 className="text-3xl font-bold text-center font-serif mt-0 pt-6 pb-4 mx-[30px]">
          {selectedEra} Era Composers
        </h1>
      </div>

      <Timeline selectedEra={selectedEra} onSelectEra={handleEraChange} />

      <div className="px-2 md:px-6 pb-8 flex-grow overflow-y-auto">
        <ComposerList era={selectedEra} onSelectComposer={onSelectComposer} selectedComposer={selectedComposer} onStartChat={onStartChat} />
      </div>
    </div>
  );
}
