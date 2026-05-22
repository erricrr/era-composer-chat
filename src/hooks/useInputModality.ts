import { useEffect, useRef } from "react";

export type InputModality = "pointer" | "keyboard";

const KEYBOARD_MODALITY_KEYS = new Set([
  "Tab",
  "Enter",
  " ",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Escape",
]);

/**
 * Tracks whether the user is navigating via pointer or keyboard.
 * Used to suppress focus rings / auto-focus after pointer-driven menu interactions.
 */
export function useInputModality() {
  const modalityRef = useRef<InputModality>("pointer");

  useEffect(() => {
    const onPointerDown = () => {
      modalityRef.current = "pointer";
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (KEYBOARD_MODALITY_KEYS.has(event.key)) {
        modalityRef.current = "keyboard";
      }
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return modalityRef;
}
