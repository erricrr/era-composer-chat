import { Composer, Era } from '@/data/composers';
import { Badge } from '@/components/ui/badge';
import { ComposerImageViewer } from '@/components/ComposerImageViewer';
import { cn } from '@/lib/utils';

export function normalizeEras(era: Era | Era[]): Era[] {
  return Array.isArray(era) ? era : [era];
}

export function formatComposerLifeYears(composer: Composer): string {
  return `${composer.nationality}, ${composer.birthYear}–${composer.deathYear || 'present'}`;
}

const variantConfig = {
  sidebar: {
    wrapperClassName: 'px-2 md:px-3 pt-1 pb-1 bg-primary-foreground',
    rowClassName: 'flex items-start md:items-center space-x-2 md:space-x-4 pb-2',
    imageSize: 'xxl' as const,
    imageClassName: 'focus-visible:z-10 relative',
    textRegionClassName:
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-1 min-w-0',
    textRegionTabIndex: 0 as const,
    textRegionRole: 'region' as const,
    showSrOnlyHeading: true,
    nameElement: 'h3' as const,
    nameClassName: 'text-xl md:text-2xl font-bold font-serif break-words',
    metaClassName: 'flex flex-col lg:flex-row lg:items-center gap-1 mt-1',
    lifeYearsClassName: 'text-base md:text-lg text-muted-foreground',
    badgeClassName: 'text-xs',
    badgeContainerClassName: 'flex flex-wrap gap-1 lg:ml-2',
  },
  chat: {
    wrapperClassName: '',
    rowClassName: 'flex items-start md:items-center space-x-2 md:space-x-4',
    imageSize: 'md' as const,
    imageClassName: 'focus-visible:z-10 relative shrink-0',
    textRegionClassName:
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-1 min-w-0',
    textRegionTabIndex: 0 as const,
    textRegionRole: 'region' as const,
    showSrOnlyHeading: false,
    nameElement: 'h1' as const,
    nameClassName: 'font-serif font-bold text-lg md:text-xl break-words',
    metaClassName: 'flex flex-col lg:flex-row lg:items-center gap-1 mt-1',
    lifeYearsClassName: 'text-base md:text-lg text-muted-foreground',
    badgeClassName: 'text-xs',
    badgeContainerClassName: 'flex flex-wrap gap-1 lg:ml-2',
  },
} as const;

interface ComposerShortBioHeaderProps {
  composer: Composer;
  variant: 'sidebar' | 'chat';
  /** When set, only render the text/meta column (image rendered separately by parent) */
  textOnly?: boolean;
  className?: string;
}

function ComposerShortBioHeaderText({
  composer,
  variant,
}: Pick<ComposerShortBioHeaderProps, 'composer' | 'variant'>) {
  const config = variantConfig[variant];
  const NameElement = config.nameElement;
  const lifeYears = formatComposerLifeYears(composer);
  const eras = normalizeEras(composer.era);

  return (
    <div
      tabIndex={config.textRegionTabIndex}
      role={config.textRegionRole}
      aria-label={
        config.textRegionRole === 'region'
          ? `Composer details: ${composer.name}, ${composer.nationality}, ${composer.birthYear}-${composer.deathYear || 'present'}`
          : undefined
      }
      className={config.textRegionClassName}
    >
      {config.showSrOnlyHeading ? <h2 className="sr-only">Composer Details</h2> : null}
      <NameElement className={config.nameClassName}>{composer.name}</NameElement>
      <div className={config.metaClassName}>
        <span className={config.lifeYearsClassName}>{lifeYears}</span>
        <div className={config.badgeContainerClassName}>
          {eras.map((era, idx) => (
            <Badge key={era + idx} variant="badge" className={config.badgeClassName}>
              {era}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComposerShortBioHeader({
  composer,
  variant,
  textOnly = false,
  className,
}: ComposerShortBioHeaderProps) {
  const config = variantConfig[variant];

  if (textOnly) {
    return <ComposerShortBioHeaderText composer={composer} variant={variant} />;
  }

  return (
    <div className={cn(config.wrapperClassName, className)}>
      <div className={config.rowClassName}>
        <ComposerImageViewer
          composer={composer}
          size={config.imageSize}
          allowModalOnDesktop={variant === 'sidebar'}
          className={config.imageClassName}
        />
        <ComposerShortBioHeaderText composer={composer} variant={variant} />
      </div>
    </div>
  );
}
