import React from 'react';

interface PortraitImageProps {
  composerId: string;
  src: string;
  alt: string;
  className?: string;
}

const defaultPosition = 'object-[50%_10%]';
const highPosition = 'object-[50%_25%]';
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


export const PortraitImage: React.FC<PortraitImageProps> = ({ composerId, src, alt, className = '' }) => {
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
      className={`w-full h-full object-cover transform ${positionClass} ${scaleClass} ${className}`}
    />
  );
};
