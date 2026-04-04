import React, { useState, useEffect } from 'react';
import { isImageCached, preloadImage } from '@/utils/imageCache';

interface PortraitImageProps {
  composerId: string;
  src: string;
  alt: string;
  className?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

const defaultPosition = 'object-[50%_10%]';
const highPosition = 'object-[50%_15%]';
const repositionOverrides = {
  'dieterich-buxtehude': highPosition,
  'johann-strauss-ii': 'object-[50%_25%]',
  'benjamin-britten': 'object-[50%_0%]',
  'gershwin': 'object-[50%_-15%]',
};

const noReposition = ['sergei-rachmaninoff', 'igor-stravinsky', 'cage'];

const scaleOverrides = {
  'george-bridgetower': 'scale-110',
  'henry-purcell': 'scale-110',
  'chevalier-de-saint-georges': 'scale-125',
  'johann-strauss-ii': 'scale-125',
  'richard-strauss': 'scale-105',
  'sergei-rachmaninoff': 'scale-110',
  'benjamin-britten': 'scale-105',
  'gershwin': 'scale-125',

};


export const PortraitImage: React.FC<PortraitImageProps> = ({ composerId, src, alt, className = '', fetchPriority = 'auto' }) => {
  const [loaded, setLoaded] = useState(() => isImageCached(src));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isImageCached(src)) {
      setLoaded(true);
      setError(false);
    } else {
      preloadImage(src).then(() => {
        setLoaded(true);
        setError(false);
      }).catch((err) => {
        console.warn(`Preload failed for ${src}, will try direct load:`, err);
        setError(false);
      });
    }
  }, [src]);

  let positionClass = '';
  if (repositionOverrides[composerId]) {
    positionClass = repositionOverrides[composerId];
  } else if (!noReposition.includes(composerId)) {
    positionClass = defaultPosition;
  }

  const scaleClass = scaleOverrides[composerId] || '';

  return (
    <img
      src={src}
      alt={alt}
      {...({ fetchpriority: fetchPriority } as React.ImgHTMLAttributes<HTMLImageElement>)}
      onLoad={() => {
        setLoaded(true);
        setError(false);
      }}
      onError={() => {
        console.error(`Failed to load image for ${composerId}: ${src}`);
        setError(true);
        setLoaded(true);
      }}
      className={`w-full h-full object-cover transform ${positionClass} ${scaleClass} ${className} transition-opacity duration-300`}
      style={{ opacity: loaded ? 1 : 0 }}
    />
  );
};
