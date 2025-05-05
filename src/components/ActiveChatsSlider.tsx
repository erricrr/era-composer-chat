import { Composer } from '@/data/composers';
import { X, Trash2 } from 'lucide-react';

interface ActiveChatsSliderProps {
  isOpen: boolean;
  activeChatIds: string[];
  composers: Composer[];
  onSelectComposer: (composer: Composer) => void;
  onClearAll: () => void;
  onClose: () => void;
  onRemoveChat: (composer: Composer) => void;
}

export default function ActiveChatsSlider({
  isOpen,
  activeChatIds,
  composers,
  onSelectComposer,
  onClearAll,
  onClose,
  onRemoveChat,
}: ActiveChatsSliderProps) {
  return (
    <aside
      className={`fixed top-10 bottom-0 right-0 w-64 z-50 bg-background border-l border-border shadow-lg transform transition-transform duration-200 ease-out flex flex-col ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
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
                <button
                  onClick={() => onRemoveChat(composer)}
                  className="p-2 text-red-600 rounded hover:bg-muted transition-colors"
                  aria-label={`Remove chat with ${composer.name}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
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
