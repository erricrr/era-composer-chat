import { useState, useCallback, useEffect, useRef } from 'react';
import { Composer, Era, isComposerInPublicDomain, composers as allComposersData, getComposersByEra } from '@/data/composers';
import { ComposerMenu } from '@/components/ComposerMenu';
import { ChatInterface } from '@/components/ChatInterface';
import ActiveChatsSlider from '@/components/ActiveChatsSlider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { useConversations } from '@/hooks/useConversations';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MessageSquare, AlertTriangle, MessageSquareOff, X } from 'lucide-react';
import FooterDrawer from '@/components/ui/footerDrawer';
import HeaderIcon from '@/components/ui/HeaderIcon';
import { ComposerSearch } from '@/components/ComposerSearch';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
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
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      console.error('Error parsing isMenuOpen from localStorage:', e);
      return false;
    }
  });

  // Track whether the menu is mounted for enter/exit transitions
  const [isMenuMounted, setIsMenuMounted] = useState(isMenuOpen);
  // Control enter (true) / exit (false) animation state
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);

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

  // State trigger to reset chat interface when clearing all active chats
  const [chatClearTrigger, setChatClearTrigger] = useState(0);

  // Active chats (up to 5) persisted in localStorage
  const [activeChatIds, setActiveChatIds] = useLocalStorage<string[]>('activeChats', []);
  const [isActiveChatsOpen, setIsActiveChatsOpen] = useState(false);
  // Track split view open state to adjust layout
  const [isSplitViewOpenFromChat, setIsSplitViewOpenFromChat] = useState(false);

  // State for controlling the About icon's tooltip
  const [aboutTooltipOpen, setAboutTooltipOpen] = useState(false);
  // State to track if the FooterDrawer is actually visible
  const [footerDrawerVisible, setFooterDrawerVisible] = useState(false);

  // Maximum number of active chats allowed
  const MAX_ACTIVE_CHATS = 5;

  // Ref for the active chats button - for focus management
  const activeChatsButtonRef = useRef<HTMLButtonElement>(null);

  // Effect to blur the active chats button if it's focused on initial page load
  useEffect(() => {
    const timerId = setTimeout(() => {
      const button = activeChatsButtonRef.current;
      if (button && document.activeElement === button) {
        button.blur();
      }
    }, 0); // setTimeout with 0 delay defers execution until after the current call stack clears

    return () => clearTimeout(timerId); // Cleanup the timeout if the component unmounts
  }, []); // Empty dependency array ensures this runs only once on mount

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
    }
  };

  // Add or move a composer to front of active chats, limit to 5
  const handleAddActiveChat = useCallback((composer: Composer) => {
    setActiveChatIds(prev => {
      // Check if the composer is already in the active chats
      const isAlreadyActive = prev.includes(composer.id);

      // Remove if already in the list
      const ids = prev.filter(id => id !== composer.id);

      // Add to the front of the list
      ids.unshift(composer.id);

      // Only show warning when we reach the maximum chat limit with a new composer
      if (ids.length === MAX_ACTIVE_CHATS && !isAlreadyActive) {
        toast.warning(
          `Active Chat Limit Reached: ${MAX_ACTIVE_CHATS}`,
          {
            description: `You've reached the maximum of ${MAX_ACTIVE_CHATS} active chats. Adding more will start to remove conversations at the bottom of the list.`,
            duration: 5000,
            icon: <AlertTriangle className="h-5 w-5 dark:text-amber-500 text-amber-600" />,
            closeButton: true
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
              toast(
                `Removed from Active Chats: ${removedComposer.name}`,
                {
                  description: "This conversation has been cleared as it exceeded the 5 chat limit.",
                  duration: 4000,
                  icon: <MessageSquareOff className="text-destructive h-5 w-5" />,
                  closeButton: true
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

  // Effect to manage mounting/unmounting with slide animations
  useEffect(() => {
    if (isMenuOpen) {
      // Mount the menu, then trigger enter animation
      setIsMenuMounted(true);
      const openTimer = setTimeout(() => setIsMenuAnimating(true), 10);
      return () => clearTimeout(openTimer);
    } else {
      // Trigger exit animation, then unmount
      setIsMenuAnimating(false);
      const closeTimer = setTimeout(() => setIsMenuMounted(false), 300);
      return () => clearTimeout(closeTimer);
    }
  }, [isMenuOpen]);

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

  // Add effect to handle iOS Safari viewport issues
  useEffect(() => {
    if (!isMobile) return;

    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      // Add a meta viewport tag to prevent scaling issues
      const existingViewport = document.querySelector('meta[name="viewport"]');
      if (existingViewport) {
        existingViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover');
      } else {
        const metaTag = document.createElement('meta');
        metaTag.name = 'viewport';
        metaTag.content = 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover';
        document.head.appendChild(metaTag);
      }

      // Add a listener to force repaint when orientation changes
      const handleOrientationChange = () => {
        // Force browser repaint
        setTimeout(() => {
          const el = document.documentElement;
          const originalHeight = el.style.height;
          el.style.height = 'initial';
          setTimeout(() => {
            el.style.height = originalHeight;
          }, 10);
        }, 300);
      };

      window.addEventListener('orientationchange', handleOrientationChange);

      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, [isMobile]);

  return (
    <TooltipProvider>
      <div className="min-h-screen overflow-hidden bg-background">
        {/* Fixed Header */}
        <header className="fixed-header" style={{ zIndex: 70 }}>
          <div className="container mx-auto px-2 flex items-center justify-between h-full">
            {/* Left Side: Menu Toggle Area */}
            <nav aria-label="Main navigation">
              <HeaderIcon tooltip={isMenuOpen ? 'Close menu' : 'Open menu'}>
                <button
                  type="button"
                  onClick={toggleMenu}
                  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMenuOpen}
                  className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-muted transition-colors duration-200 focus-ring-inset"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 transform transition-transform duration-500 ease-out"
                    style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </HeaderIcon>
            </nav>

            {/* Right Side: Search + Icons */}
            <div className="flex items-center gap-2" role="group" aria-label="App tools">
              {/* Search Bar */}
              <ComposerSearch
                composers={allComposersData}
                onSelectComposer={(composer) => handleSelectComposer(composer, { source: 'search' })}
                selectedComposer={selectedComposer}
              />

              {/* Active Chats Tab Icon */}
              <HeaderIcon tooltip="Active Chats">
                <button
                  ref={activeChatsButtonRef}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsActiveChatsOpen(prev => !prev); }}
                  aria-label="Active Chats"
                  aria-expanded={isActiveChatsOpen}
                  className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-muted transition-colors duration-200 relative z-[60] focus-ring-inset"
                >
                  <MessageSquare className={`h-5 w-5 transform transition-transform ${isActiveChatsOpen ? 'rotate-180' : ''}`} />
                </button>
              </HeaderIcon>

              {/* About Icon & Drawer */}
              <HeaderIcon
                tooltip="About"
                tooltipOpen={aboutTooltipOpen}
                onTooltipOpenChange={(radixWantsToOpen) => {
                  if (radixWantsToOpen) {
                    // Tooltip trigger is hovered/focused, Radix wants to open it.
                    // Only allow it to open if the footer drawer is NOT visible.
                    if (!footerDrawerVisible) {
                      setAboutTooltipOpen(true);
                    } else {
                      // Drawer is visible, so tooltip must stay closed.
                      setAboutTooltipOpen(false);
                    }
                  } else {
                    // Radix wants to close the tooltip (e.g. blur, pointer leave).
                    setAboutTooltipOpen(false);
                  }
                }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="relative z-[60] focus-ring-inset"
                  onPointerLeave={() => { // Explicitly close on pointer leave if drawer isn't open
                    if (!footerDrawerVisible) setAboutTooltipOpen(false);
                  }}
                >
                  <FooterDrawer
                    onTrigger={() => setAboutTooltipOpen(false)}
                    onVisibilityChange={setFooterDrawerVisible}
                  />
                </div>
              </HeaderIcon>

              {/* Theme Toggle Icon */}
              <HeaderIcon tooltip={isDarkMode ? 'Light mode' : 'Dark mode'}>
                <div onClick={(e) => e.stopPropagation()}
                className="relative z-[60]"
                >
                  <ThemeToggle onThemeChange={handleThemeChange} />
                </div>
              </HeaderIcon>
            </div>
          </div>
        </header>

        <main className="pt-11">
          {/* Composer Selection Menu - Only render when open to remove from tab order when closed */}
          {isMenuMounted && (
            <aside
              className={`fixed inset-y-0 left-0 z-50 bg-background backdrop-blur-sm border-r border-border shadow-lg transform transition-transform duration-300 ease-out ${
                isMenuAnimating ? 'translate-x-0' : '-translate-x-full'
              }`}
              style={{
                width: '100%',
                top: '2.75rem',
                ...(isMobile ? { bottom: '0' } : { height: 'calc(100dvh - 2.75rem)' })
              }}
              role="complementary"
              aria-label="Composer selection menu"
            >
              {/* Composer list rendered only when open */}
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
          )}

          {/* Chat Interface - Fixed positioning with proper overflow handling */}
          <div
            className="fixed bg-background"
            style={{
              left: 0,
              right: isSplitViewOpenFromChat ? '0' : isActiveChatsOpen ? '16rem' : '0',
              top: '2.75rem',
              ...(isMobile ? { bottom: '0' } : { height: 'calc(100dvh - 2.75rem)' }),
              backdropFilter: 'blur(8px)',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
              zIndex: 40
            }}
          >
            {!selectedComposer && (
              <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
                <div className="text-center p-4 max-w-md overflow-y-auto max-h-[calc(100vh-5.5rem)] scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent relative">
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" aria-hidden="true"></div>
                  <h2 className="text-xl font-semibold mb-2">Welcome to Era Composer Chat</h2>
                  <p className="text-muted-foreground mb-3">
                  Select a composer from the menu to start chatting with them about their life, music, and legacy. You can also use the search bar in the top right to quickly find a specific composer.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    For the best experience, consider listening to classical music while chatting&mdash;it adds wonderful context to your conversations! Try searching for 'classical music essentials' on your preferred music streaming service if you'd like to enhance your experience.
                  </p>
                  <button
                    onClick={toggleMenu}
                    className="flex items-center justify-center mx-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors mb-1"
                    aria-label="Open composer menu"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Open Composer Menu
                  </button>
                </div>
              </div>
            )}
            {selectedComposer && isComposerInPublicDomain(selectedComposer) && (
              <article className="container mx-auto px-4 h-full" aria-label={`Chat with ${selectedComposer.name}`}>
                <ChatInterface
                  key={chatClearTrigger}
                  composer={selectedComposer}
                  onUserTyping={() => {}}
                  onUserSend={handleAddActiveChat}
                  onSplitViewToggle={setIsSplitViewOpenFromChat}
                  isComposerListOpen={isMenuOpen}
                  isActiveChatsOpen={isActiveChatsOpen}
                />
              </article>
            )}
            {selectedComposer && !isComposerInPublicDomain(selectedComposer) && (
              <article className="container mx-auto px-4 h-full flex items-center justify-center" aria-label="Copyright notice">
                <div className="text-center p-6 bg-muted/50 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-2">Chat Unavailable</h2>
                  <p className="text-muted-foreground">
                    Chatting with {selectedComposer.name} is unavailable due to copyright restrictions.
                  </p>
                </div>
              </article>
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
          returnFocusRef={activeChatsButtonRef}
        />
      </div>
    </TooltipProvider>
  );
}

export default Index;
