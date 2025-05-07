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
}: ActiveChatsSliderProps) {
  // Handle removing a single chat
  const handleRemoveChat = (composer: Composer, e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the event from propagating to parent elements
    e.stopPropagation();
    e.preventDefault();

    // Call the onRemoveChat handler
    onRemoveChat(composer);
  };

  return (
    <aside
      className={`fixed top-10 bottom-0 right-0 w-64 z-60 bg-background border-l border-border shadow-lg transform transition-transform duration-200 ease-out flex flex-col ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-base font-semibold">Active Chats</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-muted transition-colors"
          aria-label="Close active chats"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat limit indicator */}
      <div className="px-4 py-2 bg-muted/50 text-xs border-b border-border flex items-center justify-between">
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
                  className="flex-1 text-left p-2 rounded hover:bg-muted transition-colors"
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
                      className="p-2 rounded hover:bg-muted transition-colors"
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
          onClick={onClearAll}
          className="w-full text-sm text-destructive hover:underline transition-colors"
        >
          Clear All
        </button>
      </div>
    </aside>
  );
}
