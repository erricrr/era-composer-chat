import { useState, useCallback, useEffect } from 'react';
import { Composer, Era, isComposerInPublicDomain, composers as allComposersData, getComposersByEra } from '@/data/composers';
import { ComposerMenu } from '@/components/ComposerMenu';
import { ChatInterface } from '@/components/ChatInterface';
import ActiveChatsSlider from '@/components/ActiveChatsSlider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { useConversations } from '@/hooks/useConversations';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MessageCircle } from 'lucide-react';
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
  const [pendingScrollComposerId, setPendingScrollComposerId] = useState<string | null>(null);

  const { startConversation, getConversationsForComposer, clearAllConversations, deleteConversation } = useConversations();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isTouch = useIsTouch();

  // State trigger to reset chat interface when clearing all active chats
  const [chatClearTrigger, setChatClearTrigger] = useState(0);

  // Active chats (up to 5) persisted in localStorage
  const [activeChatIds, setActiveChatIds] = useLocalStorage<string[]>('activeChats', []);
  const [isActiveChatsOpen, setIsActiveChatsOpen] = useState(false);
  // Track split view open state to adjust layout
  const [isSplitViewOpenFromChat, setIsSplitViewOpenFromChat] = useState(false);

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

    if (options?.source === 'search') {
      const composerEra = Array.isArray(composer.era) ? composer.era[0] : composer.era;
      if (composerEra && composerEra !== selectedEra) {
        console.log(`[Index] Source is search, changing era to ${composerEra}`);
        setSelectedEra(composerEra);
        // Set the composer after era change to ensure proper state updates
        setTimeout(() => {
          setSelectedComposer(composer);
          setShouldScrollToComposer(true);
        }, 0);
      } else {
        setSelectedComposer(composer);
        setShouldScrollToComposer(true);
      }
    } else {
      setSelectedComposer(composer);
    }
  }, [selectedEra]);

  // Effect: when selectedEra and selectedComposer match pending scroll, trigger scroll
  useEffect(() => {
    if (
      pendingScrollComposerId &&
      selectedComposer &&
      selectedComposer.id === pendingScrollComposerId
    ) {
      setShouldScrollToComposer(true);
    }
  }, [pendingScrollComposerId, selectedComposer, selectedEra]);

  const handleSelectEra = useCallback((newEra: Era) => {
    if (newEra !== selectedEra) {
      console.log(`[Index] handleSelectEra called for ${newEra}`);
      setSelectedEra(newEra);
      localStorage.setItem('selectedEra', newEra);

      // Clear the selected composer when changing eras
      setSelectedComposer(null);
      localStorage.removeItem('selectedComposer');
      setShouldScrollToComposer(false);
    }
  }, [selectedEra]);

  const handleScrollComplete = useCallback(() => {
    console.log("[Index] handleScrollComplete called, resetting scroll flag.");
    setShouldScrollToComposer(false);
    setPendingScrollComposerId(null);
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

      // Add to active chats, keep most recent at front, max 5
      handleAddActiveChat(composer);
    }
  };

  // Add or move a composer to front of active chats, limit to 5
  const handleAddActiveChat = useCallback((composer: Composer) => {
    setActiveChatIds(prev => {
      const ids = prev.filter(id => id !== composer.id);
      ids.unshift(composer.id);
      if (ids.length > 5) ids.pop();
      return ids;
    });
  }, [setActiveChatIds]);

  // Handler for clicking an active chat entry
  const handleActiveChatClick = useCallback((composer: Composer) => {
    // Switch to the selected composer chat without closing the slider
    setSelectedComposer(composer);
    localStorage.setItem('selectedComposer', JSON.stringify(composer));
    // Ensure chat view is open
    setIsChatting(true);
    localStorage.setItem('isChatting', 'true');
    setIsMenuOpen(false);
  }, [setIsChatting, setIsMenuOpen]);

  // Clear all active chats and reset conversations
  const handleClearActiveChats = useCallback(() => {
    setActiveChatIds([]);
    clearAllConversations();
    localStorage.removeItem('activeChats');
    setIsActiveChatsOpen(false);
    setChatClearTrigger(prev => prev + 1);
  }, [clearAllConversations, setActiveChatIds, setChatClearTrigger]);

  // Remove individual active chat and clear its conversation
  const handleRemoveActiveChat = useCallback((composer: Composer) => {
    // Remove from active chats list
    setActiveChatIds(prev => prev.filter(id => id !== composer.id));
    // Delete all conversations for this composer
    const composerConversations = getConversationsForComposer(composer.id);
    composerConversations.forEach(conv => deleteConversation(conv.id));
    // If this composer is currently open, reset chat interface
    if (selectedComposer?.id === composer.id) {
      setChatClearTrigger(prev => prev + 1);
    }
  }, [getConversationsForComposer, deleteConversation, setActiveChatIds, setChatClearTrigger, selectedComposer]);

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
      {/* Fixed Header */}
      <div className="fixed-header" style={{ position: 'relative', zIndex: 1000 }}>
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

            {/* Active Chats Tab Icon */}
            {!isTouch ? (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div
                    onClick={(e) => { e.stopPropagation(); setIsActiveChatsOpen(prev => !prev); }}
                    className="p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                  >
                    <MessageCircle
                      className={`h-5 w-5 transform transition-transform ${isActiveChatsOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Active Chats
                </TooltipContent>
              </Tooltip>
            ) : (
              <div
                onClick={(e) => { e.stopPropagation(); setIsActiveChatsOpen(prev => !prev); }}
                className="p-2 rounded hover:bg-muted cursor-pointer transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </div>
            )}

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

      <main className="pt-10">
        {/* Composer Selection Menu - Fixes overflow issues */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            bg-background backdrop-blur-sm border-r border-border shadow-lg
            transition-transform duration-500 ease-out will-change-transform
          `}
          style={{
            width: '100%', // Full width overlay
            top: '2.5rem', // Adjust based on your header height
            height: 'calc(100vh - 2.5rem)',
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 500ms ease-out'
          }}
        >
          {/* Important: We don't add another scrollable container here */}
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
        </aside>

        {/* Chat Interface - Fixed positioning with proper overflow handling */}
        <div
          className="fixed bg-background"
          style={{
            left: 0,
            right: isSplitViewOpenFromChat ? '0' : isActiveChatsOpen ? '16rem' : '0',
            top: '2.5rem',
            height: 'calc(100vh - 2.5rem)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
            zIndex: 40
          }}
        >
          {selectedComposer && isComposerInPublicDomain(selectedComposer) && (
            <div className="container mx-auto px-4 h-full">
              <ChatInterface
                key={chatClearTrigger}
                composer={selectedComposer}
                onUserTyping={() => {}}
                onUserSend={handleAddActiveChat}
                onSplitViewToggle={setIsSplitViewOpenFromChat}
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

      {/* Active Chats Slider */}
      <ActiveChatsSlider
        isOpen={isActiveChatsOpen}
        activeChatIds={activeChatIds}
        composers={allComposersData}
        onSelectComposer={handleActiveChatClick}
        onClearAll={handleClearActiveChats}
        onClose={() => setIsActiveChatsOpen(false)}
        onRemoveChat={handleRemoveActiveChat}
      />
    </div>
  );
}

export default Index;
