import { useEffect, useRef, type RefObject } from "react";

const HEIGHT_RATIO = 0.15;

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  );
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
  requestAnimationFrame(() => {
    textarea.scrollIntoView({ block: "center", behavior: "smooth" });
  });
  window.setTimeout(() => {
    textarea.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 400);
}

export function useVirtualKeyboard(
  enabled: boolean,
  inputRef: RefObject<HTMLTextAreaElement | null>,
): void {
  const keyboardOpenRef = useRef(false);
  const baseHeightRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

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

    const applyKeyboardDom = (open: boolean) => {
      keyboardOpenRef.current = open;

      if (open) {
        document.documentElement.classList.add("keyboard-visible");
        const chatForm = document.querySelector("form.chat-container");
        if (chatForm) {
          const el = chatForm as HTMLElement;
          el.style.position = "sticky";
          el.style.bottom = "0";
          el.style.zIndex = "40";
        }
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
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [enabled, inputRef]);
}
