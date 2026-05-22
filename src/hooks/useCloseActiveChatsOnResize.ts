import { useEffect } from "react";

/** Closes the active chats panel when the viewport is resized (only while open). */
export function useCloseActiveChatsOnResize(
  isOpen: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("resize", onClose);
    return () => window.removeEventListener("resize", onClose);
  }, [isOpen, onClose]);
}
