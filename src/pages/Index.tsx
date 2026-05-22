import {
  lazy,
  Suspense,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import {
  Composer,
  Era,
  isComposerInPublicDomain,
  composers as allComposersData,
  getComposersByEra,
} from "@/data/composers";
import { ComposerMenu } from "@/components/ComposerMenu";
import ActiveChatsSlider from "@/components/ActiveChatsSlider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useConversations } from "@/hooks/useConversations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { preloadAllComposerImages } from "@/utils/imageCache";
import { MessageSquare, X } from "lucide-react";
import { BuyMeABanhMi } from "@/components/BuyMeABanhMi";
import FooterDrawer from "@/components/ui/footerDrawer";
import HeaderIcon from "@/components/ui/HeaderIcon";
import { ComposerSearch } from "@/components/ComposerSearch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { computeActiveChatListUpdate, MAX_ACTIVE_CHATS } from "@/lib/activeChats";
import {
  notifyActiveChatsAtCapacityStartingNew,
  notifyActiveChatsRemoved,
} from "@/lib/activeChatsNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStandaloneDisplayMode } from "@/hooks/useStandaloneDisplayMode";
import {
  ACTIVE_CHATS_PANEL_TRANSITION_MS,
  getActiveChatsShellLayout,
  getComposerMenuRailAdjacencyClass,
  getMainViewportShellStyle,
  OVERLAY_PANEL_PAINT_DELAY_MS,
} from "@/lib/activeChatsLayout";
import { cn } from "@/lib/utils";

const ChatInterface = lazy(async () => {
  const module = await import("@/components/ChatInterface");
  return { default: module.ChatInterface };
});

const Index = () => {
  const isMobile = useIsMobile();
  const standaloneDisplay = useStandaloneDisplayMode();
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(
    null,
  );

  const [selectedEra, setSelectedEra] = useState<Era>(Era.Baroque);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Track whether the menu is mounted for enter/exit transitions
  const [isMenuMounted, setIsMenuMounted] = useState(isMenuOpen);
  // Control enter (true) / exit (false) animation state
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);

  const [isChatting, setIsChatting] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);

  const [shouldScrollToComposer, setShouldScrollToComposer] = useState(false);

  const {
    startConversation,
    getConversationsForComposer,
    clearAllConversations,
    deleteConversation,
  } = useConversations();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State trigger to reset chat interface when clearing all active chats
  const [chatClearTrigger, setChatClearTrigger] = useState(0);

  // Active chats (up to 5) persisted in localStorage
  const [activeChatIds, setActiveChatIds] = useLocalStorage<string[]>(
    "activeChats",
    [],
  );
  const [isActiveChatsOpen, setIsActiveChatsOpen] = useState(false);
  const handleCloseActiveChats = useCallback(() => {
    setIsActiveChatsOpen(false);
  }, []);
  // Track split view open state to adjust layout
  const [isSplitViewOpenFromChat, setIsSplitViewOpenFromChat] = useState(false);

  // State for controlling the About icon's tooltip
  const [aboutTooltipOpen, setAboutTooltipOpen] = useState(false);
  // State to track if the FooterDrawer is actually visible
  const [footerDrawerVisible, setFooterDrawerVisible] = useState(false);

  // Ref for the active chats button - for focus management
  const activeChatsButtonRef = useRef<HTMLButtonElement>(null);
  const hasShownAtCapacityStartingNewRef = useRef(false);
  const hasQueuedBackgroundImagePreload = useRef(false);

  // Effect to blur the active chats button if it's focused on initial page load
  useEffect(() => {
    const timerId = setTimeout(() => {
      const button = activeChatsButtonRef.current;
      if (button && document.activeElement === button) {
        button.blur();
      }
    }, 0);

    return () => clearTimeout(timerId);
  }, []);

  // Re-show "Active chats full" once per at-capacity stretch (not on every Start a Chat).
  useEffect(() => {
    if (activeChatIds.length < MAX_ACTIVE_CHATS) {
      hasShownAtCapacityStartingNewRef.current = false;
    }
  }, [activeChatIds.length]);

  // Preload only current-era images first so critical UI assets are prioritized.
  useEffect(() => {
    const currentEraImageUrls = [
      ...new Set(getComposersByEra(selectedEra).map((c) => c.imageUrl)),
    ];
    void preloadAllComposerImages(currentEraImageUrls, {
      batchSize: 2,
      delayBetweenBatches: 300,
    });
  }, [selectedEra]);

  // Defer preloading remaining era images until the browser is idle.
  useEffect(() => {
    if (hasQueuedBackgroundImagePreload.current) return;
    hasQueuedBackgroundImagePreload.current = true;

    const currentEraImageUrls = new Set(
      getComposersByEra(selectedEra).map((c) => c.imageUrl),
    );
    const deferredImageUrls = [
      ...new Set(
        allComposersData
          .map((c) => c.imageUrl)
          .filter((url) => !currentEraImageUrls.has(url)),
      ),
    ];

    const queueBackgroundPreload = () => {
      void preloadAllComposerImages(deferredImageUrls, {
        batchSize: 2,
        delayBetweenBatches: 450,
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(queueBackgroundPreload, {
        timeout: 3000,
      });

      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(queueBackgroundPreload, 1500);
    return () => globalThis.clearTimeout(timeoutId);
  }, [selectedEra]);

  // One-time cleanup: remove stale localStorage keys from previous sessions
  useEffect(() => {
    localStorage.removeItem("lastSelectedComposerPerEra");
  }, []);

  const handleThemeChange = (newMode: boolean) => {
    setIsDarkMode(newMode);
  };

  // Add effect to clean up overflow style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatClosing(true);
    setTimeout(() => {
      setSelectedComposer(null);
      localStorage.removeItem("selectedComposer");
      setIsChatting(false);
      localStorage.setItem("isChatting", "false");
      setIsChatClosing(false);
    }, 300); // Match animation duration
  }, []);

  const handleSelectComposer = useCallback(
    (composer: Composer | null, options?: { source?: string }) => {
      console.log(
        `[Index] handleSelectComposer called for ${composer?.name || "null"} from ${options?.source}`,
      );

      if (!composer) {
        setSelectedComposer(null);
        localStorage.removeItem("selectedComposer");
        return;
      }

      if (options?.source === "search") {
        const composerEra = Array.isArray(composer.era)
          ? composer.era[0]
          : composer.era;
        // Close menu if it's open (do this immediately, independent of era)
        if (isMenuOpen) {
          setIsMenuOpen(false);
          localStorage.setItem("isMenuOpen", "false");
        }
        if (composerEra && composerEra !== selectedEra) {
          console.log(
            `[Index] Source is search, changing era to ${composerEra}`,
          );
          setSelectedEra(composerEra);
          // Set composer AND isChatting together in the same batch so the
          // "isChatting requires a composer" guard never sees them out of sync.
          setTimeout(() => {
            setSelectedComposer(composer);
            setShouldScrollToComposer(true);
            setIsChatting(true);
            localStorage.setItem("isChatting", "true");
          }, 0);
        } else {
          setSelectedComposer(composer);
          setShouldScrollToComposer(true);
          setIsChatting(true);
          localStorage.setItem("isChatting", "true");
        }
      } else if (options?.source === "restore") {
        // When restoring from localStorage, just set the composer without side effects
        setShouldScrollToComposer(false);
        setSelectedComposer(composer);
      } else {
        setShouldScrollToComposer(false);
        setSelectedComposer(composer);
      }

      // Save to localStorage when selecting a non-null composer
      localStorage.setItem("selectedComposer", JSON.stringify(composer));
    },
    [selectedEra, isMenuOpen],
  );

  const handleSelectEra = useCallback(
    (newEra: Era) => {
      if (newEra !== selectedEra) {
        console.log(`[Index] handleSelectEra called for ${newEra}`);
        setSelectedEra(newEra);
        localStorage.setItem("selectedEra", newEra);

        // Don't clear the selected composer here - let ComposerMenu handle it
        setShouldScrollToComposer(false);
      }
    },
    [selectedEra],
  );

  const handleScrollComplete = useCallback(() => {
    console.log("[Index] handleScrollComplete called, resetting scroll flag.");
    setShouldScrollToComposer(false);
  }, []);

  const handleStartChat = useCallback(
    (composer: Composer) => {
      if (!composer) return;

      const startUpdate = computeActiveChatListUpdate(
        activeChatIds,
        composer.id,
      );
      if (
        startUpdate.evictedDueToOverflow &&
        !hasShownAtCapacityStartingNewRef.current
      ) {
        hasShownAtCapacityStartingNewRef.current = true;
        notifyActiveChatsAtCapacityStartingNew();
      }

      const composerConversations = getConversationsForComposer(composer.id);

      if (composerConversations.length === 0) {
        startConversation(composer);
      }

      // Set chatting state first so chat interface mounts before menu closes
      setIsChatting(true);
      localStorage.setItem("isChatting", "true");

      // Then close the menu - chat is already mounted behind it
      setIsMenuOpen(false);
      localStorage.setItem("isMenuOpen", "false");
    },
    [activeChatIds, getConversationsForComposer, startConversation],
  );

  // Add or move a composer to front of active chats, limit to 5
  const handleAddActiveChat = useCallback(
    (composer: Composer) => {
      setActiveChatIds((prev) => {
        const update = computeActiveChatListUpdate(prev, composer.id);

        if (update.removedComposerId) {
          try {
            const removedComposer = allComposersData.find(
              (c) => c.id === update.removedComposerId,
            );
            if (removedComposer) {
              console.log(
                `[Index] Clearing conversations for kicked composer: ${removedComposer.name}`,
              );

              const removedComposerConversations = getConversationsForComposer(
                update.removedComposerId,
              );

              for (const conv of removedComposerConversations) {
                console.log(
                  `[Index] Deleting conversation: ${conv.id} for kicked composer ${update.removedComposerId}`,
                );
                deleteConversation(conv.id);
              }

              // 6th-chat warning is shown on Start a Chat; avoid a duplicate toast on first send
              if (
                !update.evictedDueToOverflow &&
                removedComposerConversations.length > 0
              ) {
                notifyActiveChatsRemoved(removedComposer.name);
              }
            }
          } catch (error) {
            console.error(
              `[Index] Error clearing conversations for kicked composer:`,
              error,
            );
          }
        }

        return update.nextIds;
      });
    },
    [setActiveChatIds, getConversationsForComposer, deleteConversation],
  );

  // Handler for clicking an active chat entry
  const handleActiveChatClick = useCallback(
    (composer: Composer) => {
      // Switch to the selected composer chat without closing the slider
      setSelectedComposer(composer);
      localStorage.setItem("selectedComposer", JSON.stringify(composer));
      // Ensure chat view is open
      setIsChatting(true);
      localStorage.setItem("isChatting", "true");
      setIsMenuOpen(false);
    },
    [setIsChatting, setIsMenuOpen],
  );

  // Clear all active chats and reset conversations
  const handleClearActiveChats = useCallback(() => {
    setActiveChatIds([]);
    clearAllConversations();
    localStorage.removeItem("activeChats");
    setIsActiveChatsOpen(false);
    setChatClearTrigger((prev) => prev + 1);
  }, [clearAllConversations, setActiveChatIds, setChatClearTrigger]);

  // Remove individual active chat and clear its conversation
  const handleRemoveActiveChat = useCallback(
    (composer: Composer) => {
      try {
        console.log(
          `[Index] Removing chat for composer: ${composer.name} (${composer.id})`,
        );

        // First, remove from active chats list
        setActiveChatIds((prev) => {
          console.log(
            `[Index] Removing composer ID ${composer.id} from active chats`,
          );
          return prev.filter((id) => id !== composer.id);
        });

        // Next, safely delete only conversations for THIS composer
        try {
          const composerConversations = getConversationsForComposer(
            composer.id,
          );
          console.log(
            `[Index] Found ${composerConversations.length} conversations to delete for composer ${composer.id}`,
          );

          // Make sure we're only deleting conversations for this specific composer
          if (composerConversations.length > 0) {
            // Delete each conversation one by one
            for (const conv of composerConversations) {
              // Double check this conversation belongs to this composer before deleting
              if (conv.composerId === composer.id) {
                console.log(
                  `[Index] Deleting conversation: ${conv.id} for composer ${composer.id}`,
                );
                deleteConversation(conv.id);
              } else {
                console.warn(
                  `[Index] Skipping conversation ${conv.id} as it doesn't belong to composer ${composer.id}`,
                );
              }
            }
          } else {
            console.log(
              `[Index] No conversations found for composer ${composer.id}`,
            );
          }
        } catch (e) {
          console.error(
            `[Index] Error deleting conversations for composer ${composer.id}:`,
            e,
          );
        }

        // If this composer is currently open, reset chat interface
        if (selectedComposer?.id === composer.id) {
          console.log(
            `[Index] Resetting chat interface for currently open composer: ${composer.id}`,
          );
          setChatClearTrigger((prev) => prev + 1);
        }

        console.log(
          `[Index] Successfully removed chat for composer: ${composer.name}`,
        );
      } catch (error) {
        console.error(`[Index] Error in handleRemoveActiveChat:`, error);
      }
    },
    [
      getConversationsForComposer,
      deleteConversation,
      setActiveChatIds,
      setChatClearTrigger,
      selectedComposer,
    ],
  );

  const toggleMenu = () => {
    // Toggle menu state
    const newIsMenuOpen = !isMenuOpen;
    setIsMenuOpen(newIsMenuOpen);

    // Update localStorage for menu state
    localStorage.setItem("isMenuOpen", String(newIsMenuOpen));
  };

  // Effect to sync selectedComposer with localStorage
  useEffect(() => {
    if (selectedComposer) {
      localStorage.setItem(
        "selectedComposer",
        JSON.stringify(selectedComposer),
      );
    } else {
      localStorage.removeItem("selectedComposer");
    }
  }, [selectedComposer]);

  // Effect to sync selectedEra with localStorage
  useEffect(() => {
    localStorage.setItem("selectedEra", selectedEra);
  }, [selectedEra]);

  // Effect to sync isMenuOpen with localStorage - handled in toggleMenu
  // useEffect(() => {
  //   localStorage.setItem("isMenuOpen", JSON.stringify(isMenuOpen));
  // }, [isMenuOpen]);

  // Effect to sync isChatting with localStorage
  useEffect(() => {
    localStorage.setItem("isChatting", JSON.stringify(isChatting));
  }, [isChatting]);

  // Effect to manage mounting/unmounting with slide animations
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      setIsMenuMounted(true);
      const openTimer = window.setTimeout(() => {
        setIsMenuAnimating(true);
      }, OVERLAY_PANEL_PAINT_DELAY_MS);
      return () => clearTimeout(openTimer);
    }

    document.body.style.overflow = "";
    setIsMenuAnimating(false);
    const closeTimer = window.setTimeout(
      () => setIsMenuMounted(false),
      ACTIVE_CHATS_PANEL_TRANSITION_MS,
    );
    return () => clearTimeout(closeTimer);
  }, [isMenuOpen]);

  // Add effect to handle iOS Safari viewport issues
  useEffect(() => {
    if (!isMobile) return;

    // Check if we're on iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;

    if (isIOS) {
      // Add a meta viewport tag to prevent scaling issues
      const existingViewport = document.querySelector('meta[name="viewport"]');
      if (existingViewport) {
        existingViewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1, viewport-fit=cover",
        );
      } else {
        const metaTag = document.createElement("meta");
        metaTag.name = "viewport";
        metaTag.content =
          "width=device-width, initial-scale=1, viewport-fit=cover";
        document.head.appendChild(metaTag);
      }

      // Add a listener to force repaint when orientation changes
      const handleOrientationChange = () => {
        // Force browser repaint
        setTimeout(() => {
          const el = document.documentElement;
          const originalHeight = el.style.height;
          el.style.height = "initial";
          setTimeout(() => {
            el.style.height = originalHeight;
          }, 10);
        }, 300);
      };

      window.addEventListener("orientationchange", handleOrientationChange);

      return () => {
        window.removeEventListener(
          "orientationchange",
          handleOrientationChange,
        );
      };
    }
  }, [isMobile]);

  // Keep the chat state machine consistent: chatting requires an active composer.
  useEffect(() => {
    if (isChatting && !isChatClosing && !selectedComposer) {
      setIsChatting(false);
      localStorage.setItem("isChatting", "false");
    }
  }, [isChatting, isChatClosing, selectedComposer]);

  const isLandingScene = !isChatting && !isChatClosing;
  const shouldShowChatOverlay =
    (isChatting || isChatClosing) && !!selectedComposer;

  const landingInsetShell = getActiveChatsShellLayout(isActiveChatsOpen, {
    isMobile,
  });
  const landingViewportStyle = getMainViewportShellStyle(
    landingInsetShell,
    isMobile,
  );
  const chatActiveChatsShell = getActiveChatsShellLayout(isActiveChatsOpen, {
    isMobile,
    suppressForSplitView: true,
    isSplitViewOpen: isSplitViewOpenFromChat,
  });

  return (
    <TooltipProvider>
      <div className="min-h-screen overflow-hidden bg-background">
        {/* Fixed Header */}
        <header className="fixed-header" style={{ zIndex: 70 }}>
          <div className="container mx-auto px-2 flex items-center justify-between h-full">
            {/* Left Side: Menu Toggle Area */}
            <nav aria-label="Main navigation">
              <HeaderIcon tooltip={isMenuOpen ? "Close menu" : "Open menu"}>
                <button
                  type="button"
                  onClick={toggleMenu}
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMenuOpen}
                  className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-muted focus-ring-inset"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 transform transition-transform duration-300 ease-out"
                    style={{
                      transform: isMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isMenuOpen
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </button>
              </HeaderIcon>
            </nav>

            {/* Right Side: Search + Icons */}
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label="App tools"
            >
              {/* Search Bar */}
              <ComposerSearch
                composers={allComposersData}
                onSelectComposer={(composer) =>
                  handleSelectComposer(composer, { source: "search" })
                }
                selectedComposer={selectedComposer}
              />

              {/* Active Chats Tab Icon */}
              <HeaderIcon
                tooltip={
                  activeChatIds.length > 0
                    ? `Active Chats · ${activeChatIds.length}/${MAX_ACTIVE_CHATS}`
                    : "Active Chats"
                }
              >
                <button
                  ref={activeChatsButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsActiveChatsOpen((prev) => !prev);
                  }}
                  aria-label={
                    activeChatIds.length > 0
                      ? `Active Chats, ${activeChatIds.length} of ${MAX_ACTIVE_CHATS}`
                      : "Active Chats"
                  }
                  aria-expanded={isActiveChatsOpen}
                  className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-muted relative z-[60] focus-ring-inset"
                >
                  <span className="relative inline-flex">
                    <MessageSquare
                      className={cn(
                        "h-5 w-5 transform transition-transform",
                        isActiveChatsOpen && "rotate-180",
                      )}
                    />
                    {activeChatIds.length > 0 && (
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute -bottom-1 -right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-0.5 text-[9px] font-semibold tabular-nums leading-none transition-colors",
                          activeChatIds.length >= MAX_ACTIVE_CHATS
                            ? "bg-amber-500 text-white dark:bg-amber-600 dark:text-amber-50"
                            : "border border-border bg-background text-muted-foreground shadow-sm",
                        )}
                      >
                        {activeChatIds.length}
                      </span>
                    )}
                  </span>
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
                  onPointerLeave={() => {
                    // Explicitly close on pointer leave if drawer isn't open
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
              <HeaderIcon tooltip={isDarkMode ? "Light mode" : "Dark mode"}>
                <div
                  onClick={(e) => e.stopPropagation()}
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
              {...landingInsetShell.dataAttribute}
              className={cn(
                "fixed left-0 z-50 bg-background slider-animate",
                getComposerMenuRailAdjacencyClass(
                  landingInsetShell.applyDesktopInset,
                ),
                landingInsetShell.shellClass,
                isMenuAnimating ? "translate-x-0" : "-translate-x-full",
              )}
              style={landingViewportStyle}
              role="complementary"
              aria-label="Composer selection menu"
            >
              {/* Composer list rendered only when open */}
              <ComposerMenu
                onSelectComposer={handleSelectComposer}
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

          {/* Welcome stays mounted (no pop-in on menu close); inset snaps to avoid slide flash */}
          {isLandingScene && (
            <div
              {...landingInsetShell.dataAttribute}
              aria-hidden={isMenuOpen}
              inert={isMenuOpen ? true : undefined}
              className={cn(
                "fixed left-0 z-30 overflow-auto bg-background",
                landingInsetShell.shellClass,
                isMenuOpen && "pointer-events-none",
              )}
              style={landingViewportStyle}
            >
              <div className="container mx-auto flex min-h-full flex-col items-center justify-center px-4">
                <div className="max-w-3xl p-4 text-center">
                  <h1 className="text-xl font-semibold mb-2">
                    Welcome to Era Composer Chat
                  </h1>
                  <p className="text-muted-foreground mb-3">
                    Select a composer from the menu to start chatting with them
                    about their life, music, and legacy, or use the top search
                    bar to find a specific composer.{" "}
                  </p>
                  <p className="text-muted-foreground text-xs mb-3">
                    Note: Not all composers are available to chat with due to
                    copyright, but they're included for their historical
                    importance.
                  </p>
                  <button
                    onClick={toggleMenu}
                    className="flex items-center justify-center mx-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mb-1"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    Open Composer Menu
                  </button>
                  <p className="text-muted-foreground my-3">
                    <strong>
                      For a richer experience, listen to classical music while
                      you chat
                    </strong>
                    &mdash;search 'classical music essentials' on your favorite
                    streaming service.
                  </p>
                  <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:rounded-sm"
                    >
                      Privacy Policy
                    </Link>
                    <span> · </span>
                    <Link
                      to="/terms"
                      className="text-primary hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:rounded-sm"
                    >
                      Terms of Use
                    </Link>
                  </div>
                  <div className="mt-6 w-full">
                    <BuyMeABanhMi />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface - Only shown when user clicks "Start a Chat" button */}
          {shouldShowChatOverlay && (
            <div
              {...chatActiveChatsShell.dataAttribute}
              className={cn(
                "fixed bg-background transition-[opacity,transform,right] duration-300 ease-in-out motion-reduce:!transition-none motion-reduce:duration-0",
                chatActiveChatsShell.shellClass,
                isChatClosing ? "opacity-0 translate-y-4" : "opacity-100",
              )}
              style={{
                left: 0,
                ...chatActiveChatsShell.insetStyle,
                top: "2.75rem",
                ...(isMobile
                  ? { bottom: "0" }
                  : { height: "calc(100dvh - 2.75rem)" }),
                // Lighter blur in installed PWA: full blur + fixed descendants is a frequent source of jank on iOS standalone.
                backdropFilter: standaloneDisplay ? "blur(4px)" : "blur(8px)",
                boxShadow: "0 -10px 25px rgba(0,0,0,0.1)",
                zIndex: 40,
              }}
            >
              {isComposerInPublicDomain(selectedComposer) ? (
                <article
                  className="h-full w-full"
                  aria-label={`Chat with ${selectedComposer.name}`}
                >
                  <Suspense
                    fallback={<div className="h-full" aria-hidden="true" />}
                  >
                    <ChatInterface
                      key={chatClearTrigger}
                      composer={selectedComposer}
                      onUserTyping={() => {}}
                      onUserSend={handleAddActiveChat}
                      onSplitViewToggle={setIsSplitViewOpenFromChat}
                      isComposerListOpen={isMenuOpen}
                      isActiveChatsOpen={isActiveChatsOpen}
                      onClose={handleCloseChat}
                      onOpenComposerMenu={() => {
                        setIsMenuOpen(true);
                        localStorage.setItem("isMenuOpen", "true");
                      }}
                    />
                  </Suspense>
                </article>
              ) : (
                <article
                  className="container mx-auto px-4 h-full flex items-center justify-center"
                  aria-label="Copyright notice"
                >
                  <div className="text-center p-6 bg-muted/50 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">
                      Chat Unavailable
                    </h2>
                    <p className="text-muted-foreground">
                      Chatting with {selectedComposer.name} is unavailable due
                      to copyright restrictions.
                    </p>
                  </div>
                </article>
              )}
            </div>
          )}
        </main>

        {/* Active Chats Slider */}
        <ActiveChatsSlider
          isOpen={isActiveChatsOpen}
          activeChatIds={activeChatIds}
          composers={allComposersData}
          onSelectComposer={handleActiveChatClick}
          onClearAll={handleClearActiveChats}
          onClose={handleCloseActiveChats}
          onRemoveChat={handleRemoveActiveChat}
          returnFocusRef={activeChatsButtonRef}
        />
      </div>
    </TooltipProvider>
  );
};

export default Index;
