import { useState, useEffect } from "react";

/** Reflects `navigator.onLine` and browser online/offline events. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(
    () => (typeof navigator !== "undefined" ? navigator.onLine : true),
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
