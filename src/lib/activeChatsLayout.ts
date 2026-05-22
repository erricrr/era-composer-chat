import type { CSSProperties } from "react";

/** Matches ActiveChatsSlider panel width (`w-64`). */
export const ACTIVE_CHATS_PANEL_WIDTH = "16rem";

export type ActiveChatsInsetOptions = {
  /** Chat split view uses full width; suppress inset when split view is open. */
  suppressForSplitView?: boolean;
  isSplitViewOpen?: boolean;
};

export function resolveActiveChatsRightInset(
  isActiveChatsOpen: boolean,
  options?: ActiveChatsInsetOptions,
): string | number {
  if (options?.suppressForSplitView && options.isSplitViewOpen) {
    return 0;
  }
  return isActiveChatsOpen ? ACTIVE_CHATS_PANEL_WIDTH : 0;
}

export function getActiveChatsInsetStyle(
  isActiveChatsOpen: boolean,
  options?: ActiveChatsInsetOptions,
): Pick<CSSProperties, "right"> {
  return {
    right: resolveActiveChatsRightInset(isActiveChatsOpen, options),
  };
}

/** Tailwind classes for content areas that shift when the active chats panel opens. */
export const activeChatsLayoutTransitionClass =
  "transition-[right] duration-300 ease-in-out motion-reduce:!transition-none motion-reduce:duration-0";
