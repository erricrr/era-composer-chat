import { useEffect, useState } from "react";
import { ACTIVE_CHATS_PANEL_TRANSITION_MS } from "@/lib/activeChatsLayout";

/**
 * Sub-frame delay that guarantees the browser paints the "transition-enabled,
 * position-unchanged" state before the position flips.  CSS transitions only
 * fire when `transition` is defined in the *after-change* style, so we must
 * ensure the transition class is rendered for at least one frame before we
 * change `isVisible`.  10 ms is well under one frame at 60 fps (~16 ms).
 */
const PAINT_DELAY_MS = 10;

/**
 * Drives enter/exit transforms so the panel slides off-screen instead of
 * unmounting abruptly.  Backdrop stays mounted through the exit transition
 * for a matching fade-out.
 *
 * `isTransitioning` gates the CSS `slider-animate` class:
 *   true  — during the open or close animation window only
 *   false — when the panel is stably open or stably closed
 *
 * Disabling the transition while the panel is stably closed prevents
 * breakpoint-driven transform changes on viewport resize from ever
 * animating the panel into view.
 *
 * Both open and close share the same symmetric two-phase sequence:
 *   Phase 1 (PAINT_DELAY_MS)   — enable transition class, hold current position
 *   Phase 2 (TRANSITION_MS)    — flip isVisible → CSS transition fires
 *   Phase 3 (+20 ms buffer)    — disable transition class once settled
 */
export function useActiveChatsPanelTransition(isOpen: boolean) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isBackdropMounted, setIsBackdropMounted] = useState(isOpen);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsBackdropMounted(true);

      // Phase 1: enable the transition class while position is still at the
      // off-screen value, giving the browser one paint to register it.
      setIsTransitioning(true);

      // Phase 2: move to the visible position so the CSS transition fires.
      const visibleTimer = window.setTimeout(
        () => setIsVisible(true),
        PAINT_DELAY_MS,
      );

      // Phase 3: disable the transition class once the panel has fully opened.
      const doneTimer = window.setTimeout(
        () => setIsTransitioning(false),
        PAINT_DELAY_MS + ACTIVE_CHATS_PANEL_TRANSITION_MS + 20,
      );

      return () => {
        clearTimeout(visibleTimer);
        clearTimeout(doneTimer);
      };
    }

    // Phase 1: enable the transition class while position is still at the
    // on-screen value, giving the browser one paint to register it.
    setIsTransitioning(true);

    // Phase 2: move to the off-screen position so the CSS transition fires.
    const hideTimer = window.setTimeout(
      () => setIsVisible(false),
      PAINT_DELAY_MS,
    );

    // Backdrop unmounts after the slide-out animation completes.
    const backdropTimer = window.setTimeout(
      () => setIsBackdropMounted(false),
      PAINT_DELAY_MS + ACTIVE_CHATS_PANEL_TRANSITION_MS,
    );

    // Phase 3: disable the transition class once the panel has fully closed.
    const doneTimer = window.setTimeout(
      () => setIsTransitioning(false),
      PAINT_DELAY_MS + ACTIVE_CHATS_PANEL_TRANSITION_MS + 20,
    );

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(backdropTimer);
      clearTimeout(doneTimer);
    };
  }, [isOpen]);

  return { isVisible, isBackdropMounted, isTransitioning };
}
