import type { ReactNode } from "react";
import { AlertTriangle, MessageSquare, MessageSquareOff, X } from "lucide-react";
import { toast } from "sonner";
import { MAX_ACTIVE_CHATS } from "@/lib/activeChats";
import { cn } from "@/lib/utils";

const TOAST_DURATION_MS = 5000;
const EVICTION_TOAST_DURATION_MS = 6000;

/** Near the header Active Chats (message) icon. */
const ACTIVE_CHATS_TOAST_POSITION = "top-right" as const;

type ActiveChatsToastVariant = "warning" | "default" | "destructive";

type ActiveChatsToastContentProps = {
  toastId: string | number;
  title: string;
  description: string;
  icon: ReactNode;
  variant?: ActiveChatsToastVariant;
};

function ActiveChatsToastContent({
  toastId,
  title,
  description,
  icon,
  variant = "warning",
}: ActiveChatsToastContentProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto relative w-[min(100vw-2rem,22rem)] rounded-lg border border-border bg-background p-4 pr-10 shadow-lg",
        variant === "warning" && "border-l-4 border-l-amber-500/70",
        variant === "destructive" && "border-l-4 border-l-destructive/80",
      )}
    >
      <button
        type="button"
        aria-label="Dismiss notification"
        className="absolute right-2.5 top-2.5 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => toast.dismiss(toastId)}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-foreground"
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-semibold leading-tight text-foreground">
            {title}
          </p>
          <p className="text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function showActiveChatsToast(
  title: string,
  description: string,
  icon: ReactNode,
  options: { duration: number; variant?: ActiveChatsToastVariant },
): void {
  toast.custom(
    (toastId) => (
      <ActiveChatsToastContent
        toastId={toastId}
        title={title}
        description={description}
        icon={icon}
        variant={options.variant}
      />
    ),
    {
      duration: options.duration,
      position: ACTIVE_CHATS_TOAST_POSITION,
      unstyled: true,
    },
  );
}

/** Shown when a new composer fills the 5th active chat slot (4 → 5) on first message. */
export function notifyActiveChatsLimitReached(): void {
  showActiveChatsToast(
    `Active chat limit: ${MAX_ACTIVE_CHATS}`,
    `You have ${MAX_ACTIVE_CHATS} active chats. Use Active Chats in the header (message icon) to manage your list. Starting another chat will remove the oldest active chat.`,
    <AlertTriangle className="h-5 w-5 dark:text-amber-500 text-amber-600" />,
    { duration: TOAST_DURATION_MS, variant: "warning" },
  );
}

/**
 * Shown when the user taps Start a Chat while the list already has 5 active chats
 * and the composer is not already in the list (6th new chat).
 */
export function notifyActiveChatsAtCapacityStartingNew(): void {
  showActiveChatsToast(
    "Active chats full",
    `You already have ${MAX_ACTIVE_CHATS} active chats. Open Active Chats using the message icon in the header to review or remove conversations. When you send your first message in this chat, the oldest active chat will be removed.`,
    <MessageSquare className="h-5 w-5" />,
    { duration: EVICTION_TOAST_DURATION_MS, variant: "warning" },
  );
}

/** Fallback when eviction cleared stored conversations (non–6th-start edge cases). */
export function notifyActiveChatsRemoved(removedComposerName: string): void {
  showActiveChatsToast(
    `Removed from Active Chats: ${removedComposerName}`,
    "This conversation has been cleared as it exceeded the active chat limit.",
    <MessageSquareOff className="h-5 w-5 text-destructive" />,
    { duration: 4000, variant: "destructive" },
  );
}
