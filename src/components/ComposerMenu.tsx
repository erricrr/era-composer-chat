import { useState, useEffect, useCallback, useRef } from 'react';
import { Timeline } from './Timeline';
import { ComposerList } from './ComposerList';
import { Composer, Era, getComposersByEra } from '@/data/composers';

interface ComposerMenuProps {
  onSelectComposer: (composer: Composer, options?: { source?: string }) => void;
  onStartChat: (composer: Composer) => void;
  selectedComposer: Composer | null;
  isOpen: boolean;
  selectedEra: Era;
  onSelectEra: (era: Era) => void;
  shouldScrollToComposer: boolean;
  onScrollComplete: () => void;
}

export function ComposerMenu({
  onSelectComposer,
  onStartChat,
  selectedComposer,
  isOpen,
  selectedEra,
  onSelectEra,
  shouldScrollToComposer,
  onScrollComplete
}: ComposerMenuProps) {
  // State to remember the last selected composer for each era
  const [lastSelectedComposerPerEra, setLastSelectedComposerPerEra] = useState<Partial<Record<Era, Composer>>>(() => {
    try {
      const saved = localStorage.getItem('lastSelectedComposerPerEra');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Error parsing lastSelectedComposerPerEra from localStorage:', e);
      return {};
    }
  });

  // --- SCROLL POSITION STATE ---
  const mobileScrollPositions = useRef<{ [era: string]: number }>({});
  const desktopScrollPositions = useRef<{ [era: string]: number }>({});

  const getMobileScrollPosition = useCallback((era: Era) => mobileScrollPositions.current[era] ?? 0, []);
  const setMobileScrollPosition = useCallback((era: Era, pos: number) => { mobileScrollPositions.current[era] = pos; }, []);
  const getDesktopScrollPosition = useCallback((era: Era) => desktopScrollPositions.current[era] ?? 0, []);
  const setDesktopScrollPosition = useCallback((era: Era, pos: number) => { desktopScrollPositions.current[era] = pos; }, []);

  // Helper function to check if a composer belongs to an era
  const composerBelongsToEra = (composer: Composer, era: Era): boolean => {
    const composerEras = Array.isArray(composer.era) ? composer.era : [composer.era];
    return composerEras.includes(era);
  };

  // Handle era changes
  const handleEraChange = useCallback((newEra: Era) => {
    console.log(`[ComposerMenu] Changing era to ${newEra}`);
    onSelectEra(newEra);

    // Try to restore the last selected composer for this era
    const rememberedComposer = lastSelectedComposerPerEra[newEra];
    if (rememberedComposer && composerBelongsToEra(rememberedComposer, newEra)) {
      console.log(`[ComposerMenu] Restoring composer ${rememberedComposer.name} for era ${newEra}`);
      onSelectComposer(rememberedComposer, { source: 'timeline' });
    } else {
      // If no valid remembered composer for this era, clear the selection
      console.log(`[ComposerMenu] No valid composer to restore for era ${newEra}, clearing selection`);
      onSelectComposer(null, { source: 'timeline' });
    }
  }, [onSelectEra, lastSelectedComposerPerEra, onSelectComposer]);

  // Effect to restore the last selected composer on mount and era changes
  useEffect(() => {
    const rememberedComposer = lastSelectedComposerPerEra[selectedEra];
    if (rememberedComposer && !selectedComposer && composerBelongsToEra(rememberedComposer, selectedEra)) {
      console.log(`[ComposerMenu] Initial restore of composer ${rememberedComposer.name} for era ${selectedEra}`);
      onSelectComposer(rememberedComposer, { source: 'restore' });
    }
  }, [selectedEra, selectedComposer, lastSelectedComposerPerEra, onSelectComposer]);

  // Update the last selected composer for the current era whenever selectedComposer changes
  useEffect(() => {
    if (selectedComposer && composerBelongsToEra(selectedComposer, selectedEra)) {
      setLastSelectedComposerPerEra(prevMap => {
        const newMap = {
          ...prevMap,
          [selectedEra]: selectedComposer
        };
        localStorage.setItem('lastSelectedComposerPerEra', JSON.stringify(newMap));
        return newMap;
      });
    }
  }, [selectedComposer, selectedEra]);

  return (
    <div className="container mx-auto px-4 flex flex-col h-full overflow-y-auto">
      <div className="relative">
        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-center font-serif mt-0 pb-4 mx-4 sm:mx-[30px]">
          {selectedEra} Era Composers
        </h1>
      </div>

      <Timeline selectedEra={selectedEra} onSelectEra={handleEraChange} />

      <div className="px-2 md:px-6 pb-0 flex-grow overflow-visible">
        <ComposerList
          era={selectedEra}
          onSelectComposer={onSelectComposer}
          selectedComposer={selectedComposer}
          onStartChat={onStartChat}
          shouldScrollToComposer={shouldScrollToComposer}
          onScrollComplete={onScrollComplete}
          getMobileScrollPosition={getMobileScrollPosition}
          setMobileScrollPosition={setMobileScrollPosition}
          getDesktopScrollPosition={getDesktopScrollPosition}
          setDesktopScrollPosition={setDesktopScrollPosition}
        />
      </div>
    </div>
  );
}
