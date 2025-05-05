import { useState, useEffect } from 'react';

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const detectTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    detectTouch();
    window.addEventListener('touchstart', detectTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', detectTouch);
    };
  }, []);

  return isTouch;
}
