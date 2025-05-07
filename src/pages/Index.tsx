import { useState, useCallback, useEffect } from 'react';
import { Composer, Era, isComposerInPublicDomain, composers as allComposersData, getComposersByEra } from '@/data/composers';
import { ComposerMenu } from '@/components/ComposerMenu';
import { ChatInterface } from '@/components/ChatInterface';
import ActiveChatsSlider from '@/components/ActiveChatsSlider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { useConversations } from '@/hooks/useConversations';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import FooterDrawer from '@/components/ui/footerDrawer';
import { ComposerSearch } from '@/components/ComposerSearch';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useIsTouch } from '@/hooks/useIsTouch';
import { toast } from "sonner";

const Index = () => {
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(() => {
    try {
      const saved = localStorage.getItem('selectedComposer');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name) {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      console.error('Error parsing selectedComposer from localStorage:', e);
      return null;
    }
  });

  const [selectedEra, setSelectedEra] = useState<Era>(() => {
    try {
      const saved = localStorage.getItem('selectedEra');
      return saved && Object.values(Era).includes(saved as Era) ? (saved as Era) : Era.Baroque;
    } catch (e) {
      console.error('Error parsing selectedEra from localStorage:', e);
      return Era.Baroque;
    }
  });

  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('isMenuOpen');
      return saved ? JSON.parse(saved) : true;
    } catch (e) {
      console.error('Error parsing isMenuOpen from localStorage:', e);
      return true;
    }
  });

  const [isChatting, setIsChatting] = useState(() => {
    try {
      const saved = localStorage.getItem('isChatting');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      console.error('Error parsing isChatting from localStorage:', e);
      return false;
    }
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

  // Maximum number of active chats allowed
  const MAX_ACTIVE_CHATS = 5;

  const handleThemeChange = (newMode: boolean) => {
    setIsDarkMode(newMode);
  };

  // Add effect to clean up overflow style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSelectComposer = useCallback((composer: Composer | null, options?: { source?: string }) => {
    console.log(`[Index] handleSelectComposer called for ${composer?.name || 'null'} from ${options?.source}`);

    if (!composer) {
      setSelectedComposer(null);
      localStorage.removeItem('selectedComposer');
      return;
    }

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
    } else if (options?.source === 'restore') {
      // When restoring from localStorage, just set the composer without side effects
      setSelectedComposer(composer);
    } else {
      setSelectedComposer(composer);
    }

    // Save to localStorage when selecting a non-null composer
    localStorage.setItem('selectedComposer', JSON.stringify(composer));
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

      // Don't clear the selected composer here - let ComposerMenu handle it
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
      // Remove if already in the list
      const ids = prev.filter(id => id !== composer.id);

      // Add to the front of the list
      ids.unshift(composer.id);

      // Show warning when we reach the maximum chat limit
      if (ids.length === MAX_ACTIVE_CHATS) {
        toast.warning(
          `Active Chat Limit Reached: ${MAX_ACTIVE_CHATS}`,
          {
            description: `You've reached the maximum of ${MAX_ACTIVE_CHATS} active chats. Adding more will remove the oldest conversations.`,
            duration: 5000,
            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
          }
        );
      }

      // If we're exceeding the limit, get the composer ID that's being removed
      let removedComposerId: string | null = null;
      if (ids.length > MAX_ACTIVE_CHATS) {
        removedComposerId = ids[MAX_ACTIVE_CHATS]; // Get the ID that will be removed
        ids.length = MAX_ACTIVE_CHATS; // Limit the array to MAX_ACTIVE_CHATS
      }

      // If a composer was removed from the active list, clear its conversations
      if (removedComposerId) {
        try {
          // Find the composer that was removed
          const removedComposer = allComposersData.find(c => c.id === removedComposerId);
          if (removedComposer) {
            console.log(`[Index] Clearing conversations for kicked composer: ${removedComposer.name}`);

            // Get all conversations for the removed composer
            const removedComposerConversations = getConversationsForComposer(removedComposerId);

            // Delete each conversation
            if (removedComposerConversations.length > 0) {
              for (const conv of removedComposerConversations) {
                console.log(`[Index] Deleting conversation: ${conv.id} for kicked composer ${removedComposerId}`);
                deleteConversation(conv.id);
              }

              // Show a notification that the composer was removed
              toast.info(
                `Removed from Active Chats: ${removedComposer.name}`,
                {
                  description: "This conversation has been cleared as it exceeded the 5 chat limit.",
                  duration: 4000
                }
              );
            }
          }
        } catch (error) {
          console.error(`[Index] Error clearing conversations for kicked composer:`, error);
        }
      }

      return ids;
    });
  }, [setActiveChatIds, getConversationsForComposer, deleteConversation, allComposersData]);

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
    try {
      console.log(`[Index] Removing chat for composer: ${composer.name} (${composer.id})`);

      // First, remove from active chats list
      setActiveChatIds(prev => {
        console.log(`[Index] Removing composer ID ${composer.id} from active chats`);
        return prev.filter(id => id !== composer.id);
      });

      // Next, safely delete only conversations for THIS composer
      try {
        const composerConversations = getConversationsForComposer(composer.id);
        console.log(`[Index] Found ${composerConversations.length} conversations to delete for composer ${composer.id}`);

        // Make sure we're only deleting conversations for this specific composer
        if (composerConversations.length > 0) {
          // Delete each conversation one by one
          for (const conv of composerConversations) {
            // Double check this conversation belongs to this composer before deleting
            if (conv.composerId === composer.id) {
              console.log(`[Index] Deleting conversation: ${conv.id} for composer ${composer.id}`);
              deleteConversation(conv.id);
            } else {
              console.warn(`[Index] Skipping conversation ${conv.id} as it doesn't belong to composer ${composer.id}`);
            }
          }
        } else {
          console.log(`[Index] No conversations found for composer ${composer.id}`);
        }
      } catch (e) {
        console.error(`[Index] Error deleting conversations for composer ${composer.id}:`, e);
      }

      // If this composer is currently open, reset chat interface
      if (selectedComposer?.id === composer.id) {
        console.log(`[Index] Resetting chat interface for currently open composer: ${composer.id}`);
        setChatClearTrigger(prev => prev + 1);
      }

      console.log(`[Index] Successfully removed chat for composer: ${composer.name}`);
    } catch (error) {
      console.error(`[Index] Error in handleRemoveActiveChat:`, error);
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

  // Effect to sync selectedComposer with localStorage
  useEffect(() => {
    if (selectedComposer) {
      localStorage.setItem('selectedComposer', JSON.stringify(selectedComposer));
    } else {
      localStorage.removeItem('selectedComposer');
    }
  }, [selectedComposer]);

  // Effect to sync selectedEra with localStorage
  useEffect(() => {
    localStorage.setItem('selectedEra', selectedEra);
  }, [selectedEra]);

  // Effect to sync isMenuOpen with localStorage
  useEffect(() => {
    localStorage.setItem('isMenuOpen', JSON.stringify(isMenuOpen));
  }, [isMenuOpen]);

  // Effect to sync isChatting with localStorage
  useEffect(() => {
    localStorage.setItem('isChatting', JSON.stringify(isChatting));
  }, [isChatting]);

  // Effect to restore chat state on page load if a composer is selected
  useEffect(() => {
    if (selectedComposer) {
      // Ensure the selected composer belongs to the current era
      const composerEras = Array.isArray(selectedComposer.era)
        ? selectedComposer.era
        : [selectedComposer.era];

      if (composerEras.includes(selectedEra)) {
        // If composer belongs to current era, ensure chat is open
        if (!isChatting && !isMenuOpen) {
          setIsChatting(true);
        }
      } else {
        // If composer doesn't belong to current era, update era to match composer
        setSelectedEra(composerEras[0]);
      }
    }
  }, [selectedComposer, selectedEra, isChatting, isMenuOpen]);

  return (
    <TooltipProvider>
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
                <Tooltip>
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
                <Tooltip>
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
                <Tooltip>
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
    </TooltipProvider>
  );
}

export default Index;
