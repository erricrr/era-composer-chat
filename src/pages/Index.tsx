import { useState, useCallback } from 'react';
import { Composer, Era, isComposerInPublicDomain, composers as allComposersData, getComposersByEra } from '@/data/composers';
import { ComposerMenu } from '@/components/ComposerMenu';
import { ChatInterface } from '@/components/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { useConversations } from '@/hooks/useConversations';
import FooterDrawer from '@/components/ui/footerDrawer';
import { ComposerSearch } from '@/components/ComposerSearch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsTouch } from '@/hooks/useIsTouch';

const Index = () => {
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(() => {
    const saved = localStorage.getItem('selectedComposer');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedEra, setSelectedEra] = useState<Era>(() => {
    const saved = localStorage.getItem('selectedEra');
    return saved ? (saved as Era) : Era.Baroque;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    const saved = localStorage.getItem('isMenuOpen');
    return saved ? JSON.parse(saved) : true;
  });

  const [isChatting, setIsChatting] = useState(() => {
    const saved = localStorage.getItem('isChatting');
    return saved ? JSON.parse(saved) : false;
  });

  const [shouldScrollToComposer, setShouldScrollToComposer] = useState(false);

  const { startConversation, getConversationsForComposer } = useConversations();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isTouch = useIsTouch();

  const handleThemeChange = (newMode: boolean) => {
    setIsDarkMode(newMode);
  };

  const handleSelectComposer = useCallback((composer: Composer, options?: { source?: string }) => {
    console.log(`[Index] handleSelectComposer called for ${composer.name} from ${options?.source}`);

    setSelectedComposer(composer);
    localStorage.setItem('selectedComposer', JSON.stringify(composer));

    if (options?.source === 'search') {
        const composerEra = composer.era[0];
        if (composerEra && composerEra !== selectedEra) {
          console.log(`[Index] Source is search, changing era to ${composerEra}`);
          setSelectedEra(composerEra);
          localStorage.setItem('selectedEra', composerEra);
        }
    }

    setShouldScrollToComposer(options?.source === 'search');

  }, [selectedEra]);

  const handleSelectEra = useCallback((newEra: Era) => {
    if (newEra !== selectedEra) {
      console.log(`[Index] handleSelectEra called for ${newEra}`);
      setSelectedEra(newEra);
      localStorage.setItem('selectedEra', newEra);

      const composersInNewEra = getComposersByEra(newEra);
      if (composersInNewEra.length > 0) {
         setSelectedComposer(composersInNewEra[0]);
         localStorage.setItem('selectedComposer', JSON.stringify(composersInNewEra[0]));
         setShouldScrollToComposer(false);
      }
    }
  }, [selectedEra]);

  const handleScrollComplete = useCallback(() => {
    console.log("[Index] handleScrollComplete called, resetting scroll flag.");
    setShouldScrollToComposer(false);
  }, []);

  const handleStartChat = (composer: Composer) => {
    if (composer) {
      const composerConversations = getConversationsForComposer(composer.id);

      if (composerConversations.length === 0) {
        startConversation(composer);
      }

      setIsMenuOpen(false);
      localStorage.setItem('isMenuOpen', 'false');

      setTimeout(() => {
        setIsChatting(true);
        localStorage.setItem('isChatting', 'true');
      }, 500);
    }
  };

  const toggleMenu = () => {
    // Batch state updates
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);
    setIsChatting(false);

    // Batch localStorage updates in a single requestAnimationFrame
    requestAnimationFrame(() => {
      localStorage.setItem('isMenuOpen', String(newIsMenuOpen));
      localStorage.setItem('isChatting', 'false');
    });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Removed Background Decoration */}
      {/* <MusicNoteDecoration /> */}

      {/* Fixed Header */}
      <div className="fixed-header">
        <div className="container mx-auto px-2 flex items-center justify-between h-full">
          {/* Left Side: Menu Toggle Area */}
          <div
            onClick={toggleMenu}
            className="flex items-center flex-1 cursor-pointer group"
          >
            <div className="flex-shrink-0 p-1 rounded-full transition-colors duration-200 group-hover:bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transform transition-transform duration-500 ease-out will-change-transform"
                style={{
                  transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  width: '1.25rem',
                  height: '1.25rem',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </div>
          </div>

         {/* Right Side: Search + Icons */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="max-w-xs">
            <ComposerSearch
              composers={allComposersData}
              onSelectComposer={(composer) => handleSelectComposer(composer, { source: 'search' })}
              selectedComposer={selectedComposer}
            />
          </div>

          {/* Icons */}
          {!isTouch ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div onClick={(e) => e.stopPropagation()}>
                  <FooterDrawer />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                About
              </TooltipContent>
            </Tooltip>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <FooterDrawer />
            </div>
          )}

          {!isTouch ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div onClick={(e) => e.stopPropagation()}>
                  <ThemeToggle onThemeChange={handleThemeChange} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isDarkMode ? 'Toggle light mode' : 'Toggle dark mode'}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <ThemeToggle onThemeChange={handleThemeChange} />
            </div>
          )}
        </div>
        </div>
        </div>

      <main className="content-main h-full">
        {/* Composer Selection Menu */}
        <div
          className={`
            fixed inset-x-0 z-40
            bg-background backdrop-blur-sm border-b border-border shadow-lg
            transition-transform duration-500 ease-out will-change-transform
            ${isMenuOpen ? 'translate-y-0' : '-translate-y-full pointer-events-none'}
            overflow-y-auto
          `}
          style={{
            maxHeight: `calc(100vh - 1.5rem)`,
            transform: isMenuOpen ? 'translate3d(0, 0, 0)' : 'translate3d(0, -100%, 0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="pb-14">
            <ComposerMenu
              onSelectComposer={(composer) => handleSelectComposer(composer, { source: 'list' })}
              onStartChat={handleStartChat}
              selectedComposer={selectedComposer}
              isOpen={isMenuOpen}
              selectedEra={selectedEra}
              onSelectEra={handleSelectEra}
              shouldScrollToComposer={shouldScrollToComposer}
              onScrollComplete={handleScrollComplete}
            />
          </div>
        </div>

        {/* Chat Interface */}
        <div
          className="fixed inset-x-0 bottom-0 overflow-y-auto bg-background"
          style={{
            top: '2.5rem',
            height: 'calc(95vh - 2.5rem)',
            maxHeight: 'calc(95vh - 2.5rem)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
          }}
        >
          {selectedComposer && isComposerInPublicDomain(selectedComposer) && (
            <div className="container mx-auto px-4 h-full">
              <ChatInterface
                composer={selectedComposer}
                onUserTyping={() => {}}
                isComposerListOpen={isMenuOpen}
              />
            </div>
          )}
          {selectedComposer && !isComposerInPublicDomain(selectedComposer) && (
            <div className="container mx-auto px-4 h-full flex items-center justify-center">
              <div className="text-center p-6 bg-muted/50 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">Chat Unavailable</h2>
                <p className="text-muted-foreground">
                  Chatting with {selectedComposer.name} is unavailable due to copyright restrictions.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Index;
