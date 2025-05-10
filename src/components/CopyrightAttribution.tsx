import React from 'react';

interface CopyrightDetails {
  author: string;
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

interface CopyrightAttributionProps {
  copyrightDetails: CopyrightDetails | null;
  firstLinkRef?: React.RefObject<HTMLAnchorElement>;
  secondLinkRef?: React.RefObject<HTMLAnchorElement>;
}

export const CopyrightAttribution: React.FC<CopyrightAttributionProps> = ({
  copyrightDetails,
  firstLinkRef,
  secondLinkRef,
}) => {
  if (!copyrightDetails) return null;

  return (
    <>
      Image by {copyrightDetails.author} via{' '}
      <a
        ref={firstLinkRef}
        href={copyrightDetails.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {copyrightDetails.source}
      </a>
      , licensed under{' '}
      <a
        ref={secondLinkRef}
        href={copyrightDetails.licenseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {copyrightDetails.license}
      </a>
    </>
  );
};
