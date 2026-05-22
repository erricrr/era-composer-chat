import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACTIVE_CHATS_PANEL_TRANSITION_MS,
  OVERLAY_PANEL_PAINT_DELAY_MS,
} from "@/lib/activeChatsLayout";

/**
 * Sub-frame delay that guarantees the browser paints the "transition-enabled,
 * position-unchanged" state before the position flips.  CSS transitions only
 * fire when `transition` is defined in the *after-change* style, so we must
 * ensure the transition class is rendered for at least one frame before we
 * change `isVisible`.  10 ms is well under one frame at 60 fps (~16 ms).
 */
const PAINT_DELAY_MS = OVERLAY_PANEL_PAINT_DELAY_MS;

/**
 * Drives enter/exit transforms so the panel slides off-screen instead of
 * unmounting abruptly.  Backdrop stays mounted through the exit transition
 * for a matching fade-out.
 *
 * `isTransitioning` gates the CSS `slider-animate` class:
 *   true  — during the open or close animation window only
 *   false — when the panel is stably open or stably closed
 *
 * Disabling the transition while stably closed prevents breakpoint-driven
 * transform changes on viewport resize from ever animating the panel into view.
 *
 * `forceClose()` collapses the panel instantly with no animation.  It sets
 * an internal `skipNextCloseAnimationRef` flag that the effect reads when
 * `isOpen` next becomes false, so the animated close path is skipped exactly
 * once.  The flag is always reset in the effect's open branch, scoping it to
 * a single close cycle and preventing any cross-cycle leakage.
 *
 * Animated open/close share the same symmetric two-phase sequence:
 *   Phase 1 (PAINT_DELAY_MS)   — enable transition class, hold current position
 *   Phase 2 (TRANSITION_MS)    — flip isVisible → CSS transition fires
 *   Phase 3 (+20 ms buffer)    — disable transition class once settled
 */
export function useActiveChatsPanelTransition(isOpen: boolean) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isBackdropMounted, setIsBackdropMounted] = useState(isOpen);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Set by forceClose(); read by the effect when isOpen catches up to false.
  // Scoped to one close cycle — always reset in the effect's open branch.
  const skipNextCloseAnimationRef = useRef(false);

  /**
   * Instantly collapses the panel with no slide animation.
   * Call this before (or alongside) calling the parent's onClose() for
   * resize-triggered closes: the panel's CSS layout has already shifted at
   * the breakpoint boundary, so any further animation looks incorrect.
   */
  const forceClose = useCallback(() => {
    skipNextCloseAnimationRef.current = true;
    setIsVisible(false);
    setIsBackdropMounted(false);
    setIsTransitioning(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset the flag so regular user-initiated closes always animate.
      skipNextCloseAnimationRef.current = false;

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

    // ── Close path ────────────────────────────────────────────────────────────

    if (skipNextCloseAnimationRef.current) {
      // forceClose() already applied the visual state instantly.
      // Clear the flag and return — no timers, no transition.
      skipNextCloseAnimationRef.current = false;
      setIsVisible(false);
      setIsBackdropMounted(false);
      setIsTransitioning(false);
      return;
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

  return { isVisible, isBackdropMounted, isTransitioning, forceClose };
}
