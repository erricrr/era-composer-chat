import { Composer } from '@/data/composers';
import { ImageModal } from './ImageModal';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ComposerImageViewerProps {
  composer: Composer;
  size?: 'sm' | 'lg' | 'xl';  // sm = 20x20 (chat), lg = 24x24 (list), xl = 32x32 (list)
  className?: string;
  onClick?: () => void;
  allowModalOnDesktop?: boolean; // New prop to control modal behavior on desktop
}

export function ComposerImageViewer({
  composer,
  size = 'xl',
  className = '',
  onClick,
  allowModalOnDesktop = false
}: ComposerImageViewerProps) {
  // Construct a unique key for localStorage based on the composer's ID
  const localStorageKey = `imageModalOpen_${composer.id}`;

  // Initialize state from localStorage or default to false
  const [imageModalOpen, setImageModalOpen] = useState(() => {
    const storedValue = localStorage.getItem(localStorageKey);
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const isMobile = useIsMobile();

  // Effect to update localStorage when state changes
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(imageModalOpen));
  }, [imageModalOpen, localStorageKey]);

  const sizeClasses = {
    sm: 'w-20 h-20',
    lg: 'w-24 h-24',
    xl: 'w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32'  // Progressive scaling
  };

  const handleClick = () => {
    if (isMobile || allowModalOnDesktop) {
      setImageModalOpen(true);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-primary flex-shrink-0 cursor-pointer transition-transform duration-300 ease-in-out ${
          size !== 'sm' ? 'hover:scale-105' : ''
        } ${className}`}
        onClick={handleClick}
      >
        <img
          src={composer.image}
          alt={composer.name}
          className="w-full h-full object-cover"
        />
      </div>

      {(isMobile || allowModalOnDesktop) && (
        <ImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          imageSrc={composer.image}
          composerName={composer.name}
          country={composer.country}
          years={composer.years}
        />
      )}
    </>
  );
}
