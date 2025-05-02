import { useState, useEffect } from 'react';

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const detectTouch = () => {
      // Check if it's a mobile/tablet device using userAgent
      const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Check for touch capability
      const hasTouchCapability = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Only consider it a touch device if it's both touch-capable AND a mobile/tablet
      setIsTouch(isMobileOrTablet && hasTouchCapability);
    };

    detectTouch();
    window.addEventListener('touchstart', detectTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', detectTouch);
    };
  }, []);

  return isTouch;
}
