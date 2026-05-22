import { useEffect, useState } from "react";
import { ACTIVE_CHATS_PANEL_TRANSITION_MS } from "@/lib/activeChatsLayout";

/**
 * Drives enter/exit transforms so the panel slides off-screen instead of unmounting abruptly.
 * Backdrop stays mounted through the exit transition for a matching fade-out.
 */
export function useActiveChatsPanelTransition(isOpen: boolean) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isBackdropMounted, setIsBackdropMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsBackdropMounted(true);
      const openTimer = window.setTimeout(
        () => setIsVisible(true),
        10,
      );
      return () => clearTimeout(openTimer);
    }

    setIsVisible(false);
    const closeTimer = window.setTimeout(
      () => setIsBackdropMounted(false),
      ACTIVE_CHATS_PANEL_TRANSITION_MS,
    );
    return () => clearTimeout(closeTimer);
  }, [isOpen]);

  return { isVisible, isBackdropMounted };
}
