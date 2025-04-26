import { Composer } from '@/data/composers';
import { ImageModal } from './ImageModal';
import { useState } from 'react';
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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const isMobile = useIsMobile();

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
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-primary flex-shrink-0 cursor-pointer ${className}`}
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
