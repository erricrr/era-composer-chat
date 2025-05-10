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

// External link icon component
const ExternalLinkIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block ml-0.5"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const CopyrightAttribution: React.FC<CopyrightAttributionProps> = ({
  copyrightDetails,
  firstLinkRef,
  secondLinkRef,
}) => {
  if (!copyrightDetails) return null;

  const isPublicDomain = copyrightDetails.license === "Public Domain";

  return (
    <>
      <a
        ref={firstLinkRef}
        href={copyrightDetails.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 inline-flex items-center"
      >
        {copyrightDetails.author}
        <ExternalLinkIcon />
        <span className="sr-only">(opens in new window)</span>
      </a>
      ,{' '}
      {isPublicDomain ? (
        copyrightDetails.license
      ) : (
        <a
          ref={secondLinkRef}
          href={copyrightDetails.licenseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 inline-flex items-center"
        >
          {copyrightDetails.license}
          <ExternalLinkIcon />
          <span className="sr-only">(opens in new window)</span>
        </a>
      )}
      , via {copyrightDetails.source}
    </>
  );
};
