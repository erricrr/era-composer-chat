import React, { useEffect, useRef } from 'react';
import { Composer } from '@/data/composers';
import { X, MessageSquareOff, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ActiveChatsSliderProps {
  isOpen: boolean;
  activeChatIds: string[];
  composers: Composer[];
  onSelectComposer: (composer: Composer) => void;
  onClearAll: () => void;
  onClose: () => void;
  onRemoveChat: (composer: Composer) => void;
  returnFocusRef?: React.RefObject<HTMLButtonElement>;
}

// Maximum number of active chats allowed
const MAX_ACTIVE_CHATS = 5;

export default function ActiveChatsSlider({
  isOpen,
  activeChatIds,
  composers,
  onSelectComposer,
  onClearAll,
  onClose,
  onRemoveChat,
  returnFocusRef
}: ActiveChatsSliderProps) {
  // Refs for focus management
  const sliderRef = useRef<HTMLDivElement>(null);
  const headerButtonRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const clearAllButtonRef = useRef<HTMLButtonElement>(null);
  const skipReturnFocusRef = useRef<boolean>(false);

  // Handle focus management when slider opens/closes
  useEffect(() => {
    if (isOpen) {
      // Focus the close button when the slider opens
      setTimeout(() => {
        headerButtonRef.current?.focus();
      }, 100);
    } else {
      // Return focus unless skipped (e.g., closed via click)
      if (!skipReturnFocusRef.current && returnFocusRef?.current) {
        returnFocusRef.current.focus();
      }
      // Reset skip flag after handling
      skipReturnFocusRef.current = false;
    }
  }, [isOpen, returnFocusRef]);

  // Handle keyboard navigation and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Trap focus within the slider
      if (e.key === 'Tab' && sliderRef.current) {
        const focusableElements = sliderRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        // Convert NodeList to Array and filter out hidden elements
        const focusable = Array.from(focusableElements).filter(
          el => window.getComputedStyle(el as HTMLElement).display !== 'none'
        ) as HTMLElement[];

        if (focusable.length === 0) return;

        // Handle tab navigation
        if (e.shiftKey && document.activeElement === focusable[0]) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle removing a single chat
  const handleRemoveChat = (composer: Composer, e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the event from propagating to parent elements
    e.stopPropagation();
    e.preventDefault();

    // Call the onRemoveChat handler
    onRemoveChat(composer);
  };

  // Handle close click: skip focus return for pointer clicks, but restore focus for keyboard activation
  const handleCloseClick = (e: React.MouseEvent<HTMLElement>) => {
    // event.detail > 0 indicates a pointer click; keyboard activations have detail 0
    skipReturnFocusRef.current = e.detail > 0;
    onClose();
  };

  // Handle clear all click separately to skip returning focus (prevents tooltip)
  const handleClearAllClick = () => {
    skipReturnFocusRef.current = true;
    onClearAll();
  };

  return (
    <aside
      ref={sliderRef}
      className={`fixed top-10 bottom-0 right-0 w-64 z-60 bg-popover border-l border-t border-border shadow-lg transform transition-transform duration-200 ease-out flex flex-col ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Active Chats"
    >
      <div className="border-b border-border">
        <div className="group flex items-center justify-between w-full p-4">
          <div
            ref={headerButtonRef}
            tabIndex={0}
            onClick={handleCloseClick}
            className="cursor-pointer text-base font-semibold transition-colors focus-ring-inset focus:rounded-none"
          >
            Active Chats
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleCloseClick}
            className="p-1 rounded-full transition-colors duration-200 hover:bg-muted group-hover:bg-muted focus-ring-inset"
            aria-label="Close active chats"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat limit indicator */}
      <div
        tabIndex={0}
        className="px-4 py-2 bg-muted/50 text-xs border-b border-border flex items-center justify-between focus-ring-inset"
      >
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 dark:text-amber-500 text-amber-700" />
          <span className="text-muted-foreground">Limit: {activeChatIds.length}/{MAX_ACTIVE_CHATS} chats</span>
        </div>
        <span className="text-muted-foreground/70 text-[10px]">
          {MAX_ACTIVE_CHATS - activeChatIds.length} remaining
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {activeChatIds.length === 0 ? (
          <div className="text-sm text-muted-foreground">No active chats.</div>
        ) : (
          activeChatIds.map((id) => {
            const composer = composers.find((c) => c.id === id);
            if (!composer) return null;
            return (
              <div key={id} className="flex items-center justify-between">
                <button
                  onClick={() => onSelectComposer(composer)}
                  className="flex-1 text-left p-2 rounded hover:bg-muted transition-colors focus-ring-inset"
                  aria-label={`Open chat with ${composer.name}`}
                >
                  <div className="text-sm font-medium">{composer.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {Array.isArray(composer.era) ? composer.era.join(', ') : composer.era}
                  </div>
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveChat(composer, e)}
                      className="p-2 rounded hover:bg-muted transition-colors focus-ring-inset"
                      aria-label={`Remove chat with ${composer.name}`}
                    >
                      <MessageSquareOff className="w-4 h-4 text-destructive" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Remove and clear this chat
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-border">
        <button
          ref={clearAllButtonRef}
          onClick={handleClearAllClick}
          className="w-full text-sm text-destructive hover:underline transition-colors focus-ring-inset"
          aria-label="Clear all active chats"
        >
          Clear All
        </button>
      </div>
    </aside>
  );
}
