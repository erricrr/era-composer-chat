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
  const [lastSelectedComposerPerEra, setLastSelectedComposerPerEra] = useState<Partial<Record<Era, Composer>>>({});

  // --- SCROLL POSITION STATE ---
  const mobileScrollPositions = useRef<{ [era: string]: number }>({});
  const desktopScrollPositions = useRef<{ [era: string]: number }>({});

  const getMobileScrollPosition = useCallback((era: Era) => mobileScrollPositions.current[era] ?? 0, []);
  const setMobileScrollPosition = useCallback((era: Era, pos: number) => { mobileScrollPositions.current[era] = pos; }, []);
  const getDesktopScrollPosition = useCallback((era: Era) => desktopScrollPositions.current[era] ?? 0, []);
  const setDesktopScrollPosition = useCallback((era: Era, pos: number) => { desktopScrollPositions.current[era] = pos; }, []);

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
  }, [onSelectEra]);

  return (
    <div className="container mx-auto px-4 flex flex-col h-full overflow-y-auto">
      <div className="relative">
      <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-center font-serif mt-0 pb-4 mx-4 sm:mx-[30px]">
      {selectedEra} Era Composers
        </h1>
      </div>

      <Timeline selectedEra={selectedEra} onSelectEra={handleEraChange} />

      <div className="px-2 md:px-6 pb-0 flex-grow overflow-y-auto">
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
