import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
  MouseEvent,
} from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useInputModality } from "@/hooks/useInputModality";
import {
  chatActionsSheetItemClassName,
  chatActionsTriggerClassName,
} from "@/lib/menuItemStyles";
import { cn } from "@/lib/utils";

interface ChatActionsMenuProps {
  isSplitView: boolean;
  onToggleView: () => void;
  onReset: () => void;
  onCloseChat?: () => void;
  isMobile: boolean;
  disabled?: boolean;
  triggerClassName?: string;
}

type MenuAction = {
  label: string;
  ariaLabel?: string;
  onSelect: () => void;
  separatorBefore?: boolean;
};

function blurIfPointer(
  modalityRef: ReturnType<typeof useInputModality>,
  element: HTMLElement | null | undefined,
) {
  if (modalityRef.current === "pointer") {
    element?.blur();
  }
}

export function ChatActionsMenu({
  isSplitView,
  onToggleView,
  onReset,
  onCloseChat,
  isMobile,
  disabled = false,
  triggerClassName,
}: ChatActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const inputModalityRef = useInputModality();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    setOpen(false);
  }, [isMobile]);

  const viewLabel = isSplitView ? "Hide bio" : "Show bio";
  const viewActionLabel = isSplitView
    ? "Hide composer biography"
    : "Show composer biography";

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled && nextOpen) return;
    setOpen(nextOpen);
    requestAnimationFrame(() => {
      blurIfPointer(inputModalityRef, triggerRef.current);
    });
  };

  const handleTriggerClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (isMobile) setOpen(true);
  };

  const actions: MenuAction[] = [
    { label: viewLabel, ariaLabel: viewActionLabel, onSelect: onToggleView },
    { label: "Reset conversation", onSelect: onReset, separatorBefore: true },
    ...(onCloseChat
      ? [
          {
            label: "Close chat",
            onSelect: onCloseChat,
            separatorBefore: true,
          } satisfies MenuAction,
        ]
      : []),
  ];

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      aria-disabled={disabled}
      onClick={handleTriggerClick}
      className={cn(
        chatActionsTriggerClassName,
        isMobile && "touch-manipulation",
        triggerClassName,
      )}
      aria-label="Chat actions"
      aria-haspopup={isMobile ? "dialog" : "menu"}
      aria-expanded={open}
    >
      <MoreVertical className="h-5 w-5" strokeWidth={2} aria-hidden />
    </button>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] [&>button]:hidden"
            onOverlayClick={() => setOpen(false)}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Chat actions</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1">
              {actions.map(({ label, ariaLabel, onSelect }) => (
                <button
                  key={label}
                  type="button"
                  className={chatActionsSheetItemClassName}
                  aria-label={ariaLabel}
                  onClick={(e) => {
                    setOpen(false);
                    onSelect();
                    blurIfPointer(inputModalityRef, e.currentTarget);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="min-w-[12rem]"
        onCloseAutoFocus={(e) => {
          if (inputModalityRef.current === "pointer") {
            e.preventDefault();
          }
        }}
      >
        {actions.map(({ label, ariaLabel, onSelect, separatorBefore }) => (
          <Fragment key={label}>
            {separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="min-h-11 cursor-pointer text-base"
              aria-label={ariaLabel}
              onSelect={onSelect}
            >
              {label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
