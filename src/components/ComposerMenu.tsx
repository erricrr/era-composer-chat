import { useState, useCallback, useEffect, useRef } from "react";
import { Timeline } from "./Timeline";
import { ComposerList } from "./ComposerList";
import { Composer, Era } from "@/data/composers";
import { readablePanelClass } from "@/lib/readingLayout";
import { cn } from "@/lib/utils";

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
  onScrollComplete,
}: ComposerMenuProps) {
  // State to remember the last selected composer for each era
  const [lastSelectedComposerPerEra, setLastSelectedComposerPerEra] = useState<
    Partial<Record<Era, Composer>>
  >(() => {
    try {
      const saved = localStorage.getItem("lastSelectedComposerPerEra");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Ref to always have the latest value
  const lastSelectedComposerPerEraRef = useRef(lastSelectedComposerPerEra);
  useEffect(() => {
    lastSelectedComposerPerEraRef.current = lastSelectedComposerPerEra;
  }, [lastSelectedComposerPerEra]);

  // Helper function to check if a composer belongs to an era
  const composerBelongsToEra = useCallback((composer: Composer, era: Era): boolean => {
    const composerEras = Array.isArray(composer.era)
      ? composer.era
      : [composer.era];
    return composerEras.includes(era);
  }, []);

  // Handle era changes - restore the last selected composer for this era
  const handleEraChange = useCallback(
    (newEra: Era) => {
      console.log(`[ComposerMenu] Changing era to ${newEra}`);
      const currentMap = lastSelectedComposerPerEraRef.current;
      const rememberedComposer = currentMap[newEra];
      const composerForEra =
        rememberedComposer && composerBelongsToEra(rememberedComposer, newEra)
          ? rememberedComposer
          : null;

      onSelectEra(newEra);

      if (composerForEra) {
        console.log(
          `[ComposerMenu] Restoring composer ${composerForEra.name} for era ${newEra}`,
        );
        onSelectComposer(composerForEra, { source: "era-change" });
      } else {
        onSelectComposer(null, { source: "era-change" });
      }
    },
    [onSelectEra, onSelectComposer, composerBelongsToEra],
  );

  // Persist selected composer per era to localStorage
  useEffect(() => {
    setLastSelectedComposerPerEra((prevMap) => {
      const newMap = {
        ...prevMap,
        [selectedEra]: selectedComposer ?? undefined,
      };
      localStorage.setItem(
        "lastSelectedComposerPerEra",
        JSON.stringify(newMap),
      );
      return newMap;
    });
  }, [selectedComposer, selectedEra]);

  // On mount, restore the last selected composer for the current era if one exists
  useEffect(() => {
    const currentMap = lastSelectedComposerPerEraRef.current;
    const rememberedComposer = currentMap[selectedEra];
    if (
      rememberedComposer &&
      composerBelongsToEra(rememberedComposer, selectedEra) &&
      !selectedComposer
    ) {
      console.log(
        `[ComposerMenu] Restoring composer ${rememberedComposer.name} for era ${selectedEra} on mount`,
      );
      onSelectComposer(rememberedComposer, { source: "restore" });
    }
  }, []); // Only run on mount

  return (
    <div
      className={cn(
        "mx-auto mt-3 flex h-full min-w-0 flex-col overflow-hidden px-4",
        readablePanelClass,
      )}
    >
      <div className="relative">
        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-center font-serif mt-0 pb-4 mx-4 sm:mx-[30px]">
          {selectedEra} Era Composers
        </h1>
        <h2 className="sr-only">Composer selection menu</h2>
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
        />
      </div>
    </div>
  );
}
