import { useSyncExternalStore } from "react";

/**
 * True when the app runs as an installed PWA (standalone / minimal-ui) or iOS “Add to Home Screen”.
 * iOS Safari uses `navigator.standalone`; other engines use `(display-mode: standalone)`.
 */
function getStandaloneSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches
  );
}

function subscribe(onStoreChange: () => void): () => void {
  const mqStandalone = window.matchMedia("(display-mode: standalone)");
  const mqMinimal = window.matchMedia("(display-mode: minimal-ui)");
  mqStandalone.addEventListener("change", onStoreChange);
  mqMinimal.addEventListener("change", onStoreChange);
  return () => {
    mqStandalone.removeEventListener("change", onStoreChange);
    mqMinimal.removeEventListener("change", onStoreChange);
  };
}

export function useStandaloneDisplayMode(): boolean {
  return useSyncExternalStore(
    subscribe,
    getStandaloneSnapshot,
    () => false,
  );
}
