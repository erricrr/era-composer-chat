import { useState, MouseEvent, KeyboardEvent, PointerEvent } from 'react';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface ChatActionsMenuProps {
  isSplitView: boolean;
  onToggleView: () => void;
  onReset: () => void;
  onCloseChat?: () => void;
  isMobile: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  stopPropagation?: boolean;
}

export function ChatActionsMenu({
  isSplitView,
  onToggleView,
  onReset,
  onCloseChat,
  isMobile,
  disabled = false,
  triggerClassName,
  stopPropagation = false,
}: ChatActionsMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const viewLabel = isSplitView ? 'Full view' : 'Split view';
  const openViewLabel = `Open ${viewLabel.toLowerCase()}`;
  const baseTriggerClassName = 'inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const stopPropagationIfNeeded = (e: { stopPropagation: () => void }) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  const handleTriggerClick = (e: MouseEvent<HTMLButtonElement>) => {
    stopPropagationIfNeeded(e);
    if (isMobile) {
      setMobileMenuOpen(true);
    }
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      stopPropagationIfNeeded(e);
    }
  };

  const handleTriggerPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    stopPropagationIfNeeded(e);
  };

  return isMobile ? (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        onPointerDown={handleTriggerPointerDown}
        className={cn(baseTriggerClassName, 'touch-manipulation', triggerClassName)}
        aria-label="Chat actions"
        aria-haspopup="dialog"
        aria-expanded={mobileMenuOpen}
      >
        <MoreVertical className="h-5 w-5" strokeWidth={2} aria-hidden />
      </button>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] [&>button]:hidden"
          onOverlayClick={() => setMobileMenuOpen(false)}
          onClick={stopPropagation ? stopPropagationIfNeeded : undefined}
          onPointerDown={stopPropagation ? stopPropagationIfNeeded : undefined}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Chat actions</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="flex min-h-11 w-full items-center rounded-md px-3 py-3 text-left text-base font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={openViewLabel}
              onClick={() => {
                setMobileMenuOpen(false);
                onToggleView();
              }}
            >
              {viewLabel}
            </button>
            <button
              type="button"
              className="flex min-h-11 w-full items-center rounded-md px-3 py-3 text-left text-base font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => {
                setMobileMenuOpen(false);
                onReset();
              }}
            >
              Reset conversation
            </button>
            {onCloseChat ? (
              <button
                type="button"
                className="flex min-h-11 w-full items-center rounded-md px-3 py-3 text-left text-base font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onCloseChat();
                }}
              >
                Close chat
              </button>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(baseTriggerClassName, triggerClassName)}
          aria-label="Chat actions"
          onClick={stopPropagation ? stopPropagationIfNeeded : undefined}
          onPointerDown={handleTriggerPointerDown}
          onKeyDown={handleTriggerKeyDown}
        >
          <MoreVertical className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="min-w-[12rem]"
        onClick={stopPropagation ? stopPropagationIfNeeded : undefined}
        onPointerDown={stopPropagation ? stopPropagationIfNeeded : undefined}
      >
        <DropdownMenuItem
          className="min-h-11 cursor-pointer text-base"
          aria-label={openViewLabel}
          onSelect={onToggleView}
        >
          {viewLabel}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-11 cursor-pointer text-base"
          onSelect={onReset}
        >
          Reset conversation
        </DropdownMenuItem>
        {onCloseChat ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="min-h-11 cursor-pointer text-base"
              onSelect={onCloseChat}
            >
              Close chat
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
