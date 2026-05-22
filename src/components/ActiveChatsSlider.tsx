import React, { useEffect, useRef, useState } from "react";
import { Composer } from "@/data/composers";
import { X, MessageSquareOff, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useActiveChatsPanelTransition } from "@/hooks/useActiveChatsPanelTransition";
import { MAX_ACTIVE_CHATS } from "@/lib/activeChats";
import {
  activeChatsMobileBackdropClass,
  getActiveChatsPanelClassName,
} from "@/lib/activeChatsLayout";
import { cn } from "@/lib/utils";

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

export default function ActiveChatsSlider({
  isOpen,
  activeChatIds,
  composers,
  onSelectComposer,
  onClearAll,
  onClose,
  onRemoveChat,
  returnFocusRef,
}: ActiveChatsSliderProps) {
  const { isVisible, isBackdropMounted, isTransitioning } =
    useActiveChatsPanelTransition(isOpen);

  // Refs for focus management
  const sliderRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const skipReturnFocusRef = useRef<boolean>(false);
  const [pendingRemoveComposer, setPendingRemoveComposer] =
    useState<Composer | null>(null);

  // Handle focus management when slider opens/closes
  useEffect(() => {
    if (isOpen) {
      // Focus the close button when the slider opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else if (!isVisible) {
      // Dismiss any pending remove confirmation so it doesn't reappear on next open
      setPendingRemoveComposer(null);
      // Return focus after exit animation unless skipped (e.g., pointer close)
      if (!skipReturnFocusRef.current && returnFocusRef?.current) {
        returnFocusRef.current.focus();
      }
      skipReturnFocusRef.current = false;
    }
  }, [isOpen, isVisible, returnFocusRef]);

  // Handle keyboard navigation and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on escape
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Trap focus within the slider
      if (e.key === "Tab" && sliderRef.current) {
        const focusableElements = sliderRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        // Convert NodeList to Array and filter out hidden elements
        const focusable = Array.from(focusableElements).filter(
          (el) => window.getComputedStyle(el as HTMLElement).display !== "none",
        ) as HTMLElement[];

        if (focusable.length === 0) return;

        // Handle tab navigation
        if (e.shiftKey && document.activeElement === focusable[0]) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (
          !e.shiftKey &&
          document.activeElement === focusable[focusable.length - 1]
        ) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle removing a single chat
  const handleRemoveChat = (
    composer: Composer,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setPendingRemoveComposer(composer);
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLElement>) => {
    skipReturnFocusRef.current = e.detail > 0;
    onClose();
  };

  /** Mobile backdrop only (md:hidden); does not close while remove dialog is open. */
  const handleMobileBackdropClose = () => {
    if (pendingRemoveComposer) return;
    skipReturnFocusRef.current = true;
    onClose();
  };

  return (
    <>
      {isBackdropMounted ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close active chats"
          className={cn(
            activeChatsMobileBackdropClass,
            isVisible
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          onClick={handleMobileBackdropClose}
        />
      ) : null}
      <aside
        ref={sliderRef}
        className={getActiveChatsPanelClassName(isVisible, isTransitioning)}
        aria-label="Active Chats"
        role="complementary"
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className="border-b border-border">
          <div className="group flex items-center justify-between w-full p-4">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleCloseClick}
              className="order-1 w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted-foreground/25 focus-ring-inset"
              aria-label="Close active chats"
            >
              <X className="w-4 h-4" />
            </button>
            <div
              tabIndex={isOpen ? 0 : -1}
              className="order-0 text-base font-semibold focus-ring-inset focus:rounded-none"
            >
              Active Chats
            </div>
          </div>
        </div>

        <div
          tabIndex={isOpen ? 0 : -1}
          className="px-4 py-2 bg-muted/50 text-xs border-b border-border flex items-center justify-between focus-ring-inset focus:rounded-none"
        >
          <div className="flex items-center gap-1 min-w-0">
            <AlertTriangle className="h-3 w-3 shrink-0 dark:text-amber-500 text-amber-700" />
            <span className="truncate text-muted-foreground">
              Limit: {activeChatIds.length}/{MAX_ACTIVE_CHATS} chats
            </span>
          </div>
          <span className="shrink-0 text-muted-foreground/70 text-[10px]">
            {MAX_ACTIVE_CHATS - activeChatIds.length} remaining
          </span>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {activeChatIds.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No active chats.
            </div>
          ) : (
            activeChatIds.map((id) => {
              const composer = composers.find((c) => c.id === id);
              if (!composer) return null;
              return (
                <div key={id} className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectComposer(composer)}
                    className="min-w-0 flex-1 rounded p-2 text-left hover:bg-muted focus-ring-inset"
                    aria-label={`Open chat with ${composer.name}`}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <div className="truncate text-sm font-medium">
                      {composer.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {Array.isArray(composer.era)
                        ? composer.era.join(", ")
                        : composer.era}
                    </div>
                  </button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveChat(composer, e)}
                        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted focus-ring-inset shrink-0"
                        aria-label={`Remove chat with ${composer.name}`}
                        tabIndex={isOpen ? 0 : -1}
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
        <AlertDialog
          open={!!pendingRemoveComposer}
          onOpenChange={(open) => {
            if (!open) {
              setPendingRemoveComposer(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your conversation with{" "}
                <strong>{pendingRemoveComposer?.name}</strong>. You can&apos;t
                undo this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={cn(buttonVariants({ variant: "destructive" }))}
                onClick={() => {
                  if (pendingRemoveComposer) {
                    onRemoveChat(pendingRemoveComposer);
                  }
                  setPendingRemoveComposer(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </aside>
    </>
  );
}
