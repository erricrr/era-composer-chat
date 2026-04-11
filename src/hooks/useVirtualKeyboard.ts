import { useEffect, useRef, type RefObject } from "react";

const HEIGHT_RATIO = 0.15;

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  );
}

/** Distance from the layout viewport bottom to the visual viewport bottom (keyboard / browser UI). */
export function syncKeyboardVisualInset(): void {
  const vv = window.visualViewport;
  if (!vv) {
    document.documentElement.style.setProperty("--keyboard-visual-inset", "0px");
    return;
  }
  const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  document.documentElement.style.setProperty("--keyboard-visual-inset", `${inset}px`);
}

function isKeyboardLikelyOpen(baseHeight: number): boolean {
  const vv = window.visualViewport;
  if (vv) {
    const diff = baseHeight - vv.height;
    return diff > baseHeight * HEIGHT_RATIO;
  }
  const diff = baseHeight - window.innerHeight;
  return diff > baseHeight * (isIOS() ? HEIGHT_RATIO : 0.2);
}

export function scrollChatTextareaIntoView(textarea: HTMLTextAreaElement | null): void {
  if (!textarea) return;
  // Keep viewport metrics fresh, but avoid textarea.scrollIntoView on mobile:
  // it can scroll the visual viewport/document and push the chat header off-screen.
  syncKeyboardVisualInset();
  requestAnimationFrame(() => {
    syncKeyboardVisualInset();
  });
  window.setTimeout(() => {
    syncKeyboardVisualInset();
  }, 100);
  window.setTimeout(() => {
    syncKeyboardVisualInset();
  }, 400);
}

export function useVirtualKeyboard(
  enabled: boolean,
  inputRef: RefObject<HTMLTextAreaElement | null>,
): void {
  const keyboardOpenRef = useRef(false);
  const baseHeightRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.setProperty("--keyboard-visual-inset", "0px");
      return;
    }

    const updateBaseWhenKeyboardClosed = () => {
      if (!keyboardOpenRef.current) {
        baseHeightRef.current = Math.max(
          window.innerHeight,
          window.visualViewport?.height ?? 0,
          baseHeightRef.current ?? 0,
        );
      }
    };

    baseHeightRef.current = window.innerHeight;
    updateBaseWhenKeyboardClosed();
    syncKeyboardVisualInset();

    const applyKeyboardDom = (open: boolean) => {
      keyboardOpenRef.current = open;

      if (open) {
        document.documentElement.classList.add("keyboard-visible");
        syncKeyboardVisualInset();
        scrollChatTextareaIntoView(inputRef.current);
      } else {
        document.documentElement.classList.remove("keyboard-visible");
        document.body.style.height = "";
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        baseHeightRef.current = window.innerHeight;
      }
    };

    const check = () => {
      syncKeyboardVisualInset();
      const base = baseHeightRef.current ?? window.innerHeight;
      const open = isKeyboardLikelyOpen(base);
      if (open === keyboardOpenRef.current) return;
      applyKeyboardDom(open);
      if (!open) updateBaseWhenKeyboardClosed();
    };

    window.addEventListener("resize", check);
    window.addEventListener("focusin", check);
    window.addEventListener("focusout", check);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", check);
      window.visualViewport.addEventListener("scroll", check);
    }

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("focusin", check);
      window.removeEventListener("focusout", check);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", check);
        window.visualViewport.removeEventListener("scroll", check);
      }
      document.documentElement.classList.remove("keyboard-visible");
      document.documentElement.style.setProperty("--keyboard-visual-inset", "0px");
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [enabled, inputRef]);
}
