'use client';

import { useState, type ReactNode } from 'react';
import type { CvView } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { AppearanceInit } from '@/components/layout/appearance-init';
import { persistCvView } from '@/lib/appearance';
import { CvStandard, type CvStrings } from './cv-standard';
import { CvCompact } from './cv-compact';
import { CvTimeline } from './cv-timeline';
import { CvViewSwitcher, type CvViewSwitcherLabels } from './cv-view-switcher';

type CvContentProps = {
  locale: Locale;
  strings: CvStrings;
  switcherLabels: CvViewSwitcherLabels;
  /** Reservado para el botón de compartir vista (T25) — se renderiza tras el switcher. */
  shareSlot?: ReactNode;
};

/**
 * Isla client que posee la vista activa del CV: la inicializa desde `AppearanceInit`
 * (URL > storage > default, T20) y la actualiza al elegir en el switcher, persistiendo
 * la elección. Las 3 vistas (T24) son presentacionales y reciben los mismos datos.
 */
export function CvContent({ locale, strings, switcherLabels, shareSlot }: CvContentProps) {
  const [view, setView] = useState<CvView>('standard');

  function handleChange(next: CvView) {
    setView(next);
    persistCvView(next);
  }

  return (
    <>
      <AppearanceInit onView={setView} />
      <div className="flex items-center justify-between gap-4">
        <CvViewSwitcher view={view} onChange={handleChange} labels={switcherLabels} />
        {shareSlot}
      </div>
      {view === 'standard' && <CvStandard locale={locale} strings={strings} />}
      {view === 'compact' && <CvCompact locale={locale} strings={strings} />}
      {view === 'timeline' && <CvTimeline locale={locale} strings={strings} />}
    </>
  );
}
