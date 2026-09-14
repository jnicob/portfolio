'use client';

import { useState, type ReactNode } from 'react';
import type { CvView } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { AppearanceInit } from '@/components/layout/appearance-init';
import { PrintButton } from '@/components/layout/print-button';
import { ShareViewButton, type ShareViewButtonLabels } from '@/components/layout/share-view-button';
import { persistCvView } from '@/lib/appearance';
import { CvHeader } from './cv-header';
import { CvStandard, type CvStrings } from './cv-standard';
import { CvCompact } from './cv-compact';
import { CvTimeline } from './cv-timeline';
import { CvViewSwitcher, type CvViewSwitcherLabels } from './cv-view-switcher';

type CvContentProps = {
  locale: Locale;
  strings: CvStrings;
  switcherLabels: CvViewSwitcherLabels;
  /** Print button label in CV */
  printLabel?: string;
  /**
   * Labels for the "Share this view" button (T25). If provided, `CvContent` renders
   * `ShareViewButton` with the active view (state owned here, not in caller).
   */
  shareLabels?: ShareViewButtonLabels;
  /** Generic slot for additional content after switcher (usage outside CV). */
  shareSlot?: ReactNode;
};

/**
 * Client island that owns the active CV view: initializes from `AppearanceInit`
 * (URL > storage > default, T20) and updates when selected in switcher, persisting
 * the choice. The 3 views (T24) are presentational and receive the same data.
 */
export function CvContent({
  locale,
  strings,
  switcherLabels,
  printLabel,
  shareLabels,
  shareSlot,
}: CvContentProps) {
  const [view, setView] = useState<CvView>('standard');

  function handleChange(next: CvView) {
    setView(next);
    persistCvView(next);
  }

  return (
    <>
      <AppearanceInit onView={setView} />
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CvViewSwitcher view={view} onChange={handleChange} labels={switcherLabels} />
        <div className="flex items-center gap-3">
          {printLabel && <PrintButton label={printLabel} />}
          {shareLabels && <ShareViewButton view={view} labels={shareLabels} />}
          {shareSlot}
        </div>
      </div>
      <CvHeader
        locale={locale}
        showBriefLabel={strings.showBrief}
        hideBriefLabel={strings.hideBrief}
        showPhotoLabel={strings.showPhoto}
        hidePhotoLabel={strings.hidePhoto}
      />
      {view === 'standard' && <CvStandard locale={locale} strings={strings} />}
      {view === 'compact' && <CvCompact locale={locale} strings={strings} />}
      {view === 'timeline' && <CvTimeline locale={locale} strings={strings} />}
    </>
  );
}
