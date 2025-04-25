import { useState, useEffect } from 'react';
import { Timeline } from './Timeline';
import { ComposerList } from './ComposerList';
import { Composer, Era, getComposersByEra } from '@/data/composers';
import FooterDrawer from '@/components/ui/footerDrawer';

interface ComposerMenuProps {
  onSelectComposer: (composer: Composer) => void;
  onStartChat: (composer: Composer) => void;
  selectedComposer: Composer | null;
  isOpen: boolean;
}

export function ComposerMenu({
  onSelectComposer,
  onStartChat,
  selectedComposer,
  isOpen
}: ComposerMenuProps) {
  // Initialize era from localStorage or default to Baroque
  const [selectedEra, setSelectedEra] = useState<Era>(() => {
    const saved = localStorage.getItem('selectedEra');
    return saved ? (saved as Era) : Era.Baroque;
  });
  // State to remember the last selected composer for each era
  const [lastSelectedComposerPerEra, setLastSelectedComposerPerEra] = useState<Partial<Record<Era, Composer>>>({});

  // Update the last selected composer for the current era whenever selectedComposer changes
  useEffect(() => {
    if (selectedComposer) {
      setLastSelectedComposerPerEra(prevMap => ({
        ...prevMap,
        [selectedComposer.era]: selectedComposer
      }));
    }
  }, [selectedComposer]);

  // Handle era changes
  const handleEraChange = (newEra: Era) => {
    setSelectedEra(newEra);
    // Save to localStorage
    localStorage.setItem('selectedEra', newEra);

    const rememberedComposer = lastSelectedComposerPerEra[newEra];
    if (rememberedComposer) {
      onSelectComposer(rememberedComposer);
    } else {
      const composersInEra = getComposersByEra(newEra);
      if (composersInEra.length > 0) {
        onSelectComposer(composersInEra[0]);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col h-full overflow-y-auto">
      <div className="relative">
        <h1 className="text-3xl font-bold text-center font-serif mt-2 mb-4 mx-[30px]">
          {selectedEra === Era.Modern ? '20th-21st Century' : selectedEra} Era Composers
        </h1>
        <div className="absolute top-1/2 right-14 -translate-y-1/2 z-10">
          <FooterDrawer />
        </div>
      </div>

      <Timeline selectedEra={selectedEra} onSelectEra={handleEraChange} />

      <div className="px-2 md:px-6 pb-8 flex-grow overflow-y-auto">
        <ComposerList era={selectedEra} onSelectComposer={onSelectComposer} selectedComposer={selectedComposer} onStartChat={onStartChat} />
      </div>
    </div>
  );
}
