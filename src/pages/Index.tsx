import { useState, useCallback, useEffect } from 'react';
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

  // Add effect to clean up overflow style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
    // Toggle menu state
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);

    if (newIsMenuOpen) {
      // If opening menu, stop chat
      setIsChatting(false);
      localStorage.setItem('isChatting', 'false');

      // Prevent body scrolling when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scrolling when menu is closed
      document.body.style.overflow = '';
    }

    // Update localStorage for menu state
    localStorage.setItem('isMenuOpen', String(newIsMenuOpen));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Removed Background Decoration */}
      {/* <MusicNoteDecoration /> */}

      {/* Fixed Header */}
      <div className="fixed-header z-50">
        <div className="container mx-auto px-2 flex items-center justify-between h-full">
          {/* Left Side: Menu Toggle Area */}
          <div
            onClick={toggleMenu}
            className="flex items-center cursor-pointer group"
          >
            <div className="flex-shrink-0 p-2 rounded transition-colors duration-200 group-hover:bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transform transition-transform duration-500 ease-out"
                style={{
                  transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
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
        {/* Composer Selection Menu - Now slides from left and overlays chat, no fade, better overflow handling */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            bg-background backdrop-blur-sm border-r border-border shadow-lg
            transition-transform duration-500 ease-out will-change-transform
            flex flex-col
          `}
          style={{
            width: '100%', // Full width overlay
            top: '2.5rem', // Adjust based on your header height
            height: 'calc(100vh - 2.5rem)',
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 500ms ease-out'
          }}
        >
          <div className="flex-1 overflow-hidden">
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
        </aside>

        {/* Chat Interface */}
        <div
          className="fixed inset-x-0 bottom-0 overflow-y-auto bg-background"
          style={{
            top: '2.5rem',
            height: 'calc(95vh - 2.5rem)',
            maxHeight: 'calc(95vh - 2.5rem)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
            zIndex: 40
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
