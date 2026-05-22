import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Aligns with `useIsMobile` / Tailwind `md` (768px). */
export const ACTIVE_CHATS_DESKTOP_MIN_WIDTH_PX = 768;

/** Matches desktop right-rail panel width. */
export const ACTIVE_CHATS_PANEL_WIDTH = "16rem";

/** Aligns with `.slider-animate` and inset shell transitions. */
export const ACTIVE_CHATS_PANEL_TRANSITION_MS = 300;

export type ActiveChatsLayoutOptions = {
  /** When true, content does not inset (mobile bottom sheet overlays). */
  isMobile?: boolean;
  /** Chat split view uses full width; suppress inset when split view is open. */
  suppressForSplitView?: boolean;
  isSplitViewOpen?: boolean;
};

/** Desktop right-rail is active: panel open, not mobile, split view not consuming width. */
export function usesDesktopActiveChatsRail(
  isActiveChatsOpen: boolean,
  options?: ActiveChatsLayoutOptions,
): boolean {
  if (!isActiveChatsOpen || options?.isMobile) {
    return false;
  }
  if (options?.suppressForSplitView && options?.isSplitViewOpen) {
    return false;
  }
  return true;
}

export function getActiveChatsInsetStyle(
  applyDesktopInset: boolean,
): Pick<CSSProperties, "right"> {
  return {
    right: applyDesktopInset ? ACTIVE_CHATS_PANEL_WIDTH : 0,
  };
}

/** Tailwind classes for content areas that shift when the desktop rail is open. */
export const activeChatsLayoutTransitionClass =
  "transition-[right] duration-300 ease-in-out motion-reduce:!transition-none motion-reduce:duration-0";

/** HTML attribute toggled on inset shells while the desktop rail is open. */
export const ACTIVE_CHATS_OPEN_ATTR = "data-active-chats-open";

/** Prevents flex/grid children from overflowing under the desktop rail. */
export const activeChatsInsetShellClass =
  "min-w-0 max-w-full overflow-x-hidden";

export function getActiveChatsOpenDataAttribute(
  applyDesktopInset: boolean,
): Record<string, string | undefined> {
  return applyDesktopInset ? { [ACTIVE_CHATS_OPEN_ATTR]: "" } : {};
}

export type ActiveChatsShellLayout = {
  applyDesktopInset: boolean;
  dataAttribute: Record<string, string | undefined>;
  insetStyle: Pick<CSSProperties, "right">;
  shellClass: string | false;
};

/** Single entry point for inset shells (menu, welcome, chat overlay, split view). */
export function getActiveChatsShellLayout(
  isActiveChatsOpen: boolean,
  options?: ActiveChatsLayoutOptions,
): ActiveChatsShellLayout {
  const applyDesktopInset = usesDesktopActiveChatsRail(
    isActiveChatsOpen,
    options,
  );
  return {
    applyDesktopInset,
    dataAttribute: getActiveChatsOpenDataAttribute(applyDesktopInset),
    insetStyle: getActiveChatsInsetStyle(applyDesktopInset),
    shellClass: applyDesktopInset && activeChatsInsetShellClass,
  };
}

/**
 * Composer menu edge when docked against the active-chats rail (single shared seam).
 * Avoids double border/shadow with the rail’s border-l.
 */
export function getComposerMenuRailAdjacencyClass(
  applyDesktopInset: boolean,
): string {
  return applyDesktopInset
    ? "border-r-0 shadow-none"
    : "border-r border-border shadow-lg";
}

/**
 * Panel: bottom sheet on mobile, right rail on md+. `isVisible` drives slide transform.
 *
 * `isTransitioning` gates the CSS transition: when false (panel stably open or closed) the
 * `slider-animate` class is omitted so that viewport-resize breakpoint switches between the
 * mobile (translateY) and desktop (translateX) off-screen positions never animate the panel
 * into view while it is already hidden.
 */
export function getActiveChatsPanelClassName(
  isVisible: boolean,
  isTransitioning: boolean,
): string {
  return cn(
    // Mobile z-[150] matches FooterDrawer; desktop z-60 stays under the header (z-70)
    // slider-animate (transition: transform) is enabled only while actually animating so
    // that breakpoint-driven transform changes on resize are always instantaneous.
    isTransitioning && "slider-animate",
    "fixed z-[150] md:z-60 flex flex-col bg-background",
    // Mobile — bottom sheet (overlays content; no page inset)
    "inset-x-0 bottom-0 w-full max-h-[min(85dvh,32rem)] rounded-t-2xl border-t border-border shadow-lg",
    "pb-[max(0px,env(safe-area-inset-bottom))]",
    isVisible
      ? "translate-y-0 pointer-events-auto"
      : "translate-y-full pointer-events-none",
    // Desktop — right rail (sole divider + outward shadow on the right edge)
    "md:inset-x-auto md:left-auto md:top-10 md:bottom-0 md:right-0 md:w-64 md:max-h-none",
    "md:rounded-none md:border-l md:border-t-0 md:pb-0",
    "md:shadow-[4px_0_16px_-4px_rgba(0,0,0,0.1)]",
    isVisible
      ? "md:translate-x-0 md:translate-y-0 md:pointer-events-auto"
      : "md:translate-x-full md:translate-y-0 md:pointer-events-none",
  );
}

/** Same full-viewport coverage as DrawerOverlay (info drawer) — above header z-70. */
export const activeChatsMobileBackdropClass =
  "fixed inset-0 z-[100] bg-secondary/60 transition-opacity duration-300 ease-in-out motion-reduce:!transition-none motion-reduce:duration-0 md:hidden";
