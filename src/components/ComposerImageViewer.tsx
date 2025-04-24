import { Composer } from '@/data/composers';
import { ImageModal } from './ImageModal';
import { useState } from 'react';

interface ComposerImageViewerProps {
  composer: Composer;
  size?: 'sm' | 'lg';  // sm = 20x20 (chat), lg = 24x24 (list)
  className?: string;
}

export function ComposerImageViewer({
  composer,
  size = 'lg',
  className = ''
}: ComposerImageViewerProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  return (
    <>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-primary flex-shrink-0 cursor-pointer ${className}`}
        onClick={() => setImageModalOpen(true)}
      >
        <img
          src={composer.image}
          alt={composer.name}
          className="w-full h-full object-cover"
        />
      </div>

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={composer.image}
        composerName={composer.name}
        country={composer.country}
        years={composer.years}
      />
    </>
  );
}
