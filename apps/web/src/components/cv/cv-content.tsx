'use client';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import type { CvView } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { AppearanceInit } from '@/components/layout/appearance-init';
import { PrintButton } from '@/components/layout/print-button';
import { ShareViewButton, type ShareViewButtonLabels } from '@/components/layout/share-view-button';
import { buttonVariants } from '@/components/ui/button';
import { persistCvView, STORAGE_KEYS } from '@/lib/appearance';
import { cn } from '@/lib/cn';
import { publicCvPdfDownloadName, publicCvPdfUrl } from '@/lib/cv-pdf-paths';
import { isLoopbackHost } from '@/lib/local-private-cv';
import { CvHeader, type CvPrivateContact } from './cv-header';
import { CvStandard, type CvStrings } from './cv-standard';
import { CvCompact } from './cv-compact';
import { CvTimeline } from './cv-timeline';
import { CvViewSwitcher, type CvViewSwitcherLabels } from './cv-view-switcher';

type CvContentProps = {
  locale: Locale;
  strings: CvStrings;
  privateContact?: CvPrivateContact;
  /** True only in local dev with CV_INCLUDE_PRIVATE=true; fetches contact via loopback POST. */
  localPrivateEnabled?: boolean;
  switcherLabels: CvViewSwitcherLabels;
  /** Direct pre-generated PDF download label in CV */
  downloadPdfLabel?: string;
  /** Error message shown if local private PDF download fails */
  privatePdfErrorLabel?: string;
  /** Explicit public-PDF fallback link label shown next to private download error */
  privatePdfFallbackLabel?: string;
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
  privateContact: privateContactProp,
  localPrivateEnabled = false,
  switcherLabels,
  downloadPdfLabel,
  privatePdfErrorLabel,
  privatePdfFallbackLabel,
  printLabel,
  shareLabels,
  shareSlot,
}: CvContentProps) {
  const [view, setView] = useState<CvView>('standard');
  const [showPhoto, setShowPhoto] = useState(false);
  const [fetchedPrivateContact, setFetchedPrivateContact] = useState<CvPrivateContact | undefined>(
    undefined,
  );
  const [privateDownloadError, setPrivateDownloadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const urlPhoto = new URLSearchParams(window.location.search).get('photo');
      if (urlPhoto === '1' || urlPhoto === 'true') {
        setShowPhoto(true);
        return;
      }
      if (urlPhoto === '0' || urlPhoto === 'false') {
        setShowPhoto(false);
        return;
      }
      const stored = localStorage.getItem(STORAGE_KEYS.cvPhoto);
      if (stored !== null) {
        setShowPhoto(stored === 'true');
      }
    } catch {
      /* Storage or location not available */
    }
  }, []);

  useEffect(() => {
    if (!localPrivateEnabled || privateContactProp) return;
    if (typeof window === 'undefined' || !isLoopbackHost(window.location.hostname)) return;

    const controller = new AbortController();
    fetch('/api/cv-pdf-local/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'contact' }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? (res.json() as Promise<CvPrivateContact>) : undefined))
      .then((data) => {
        if (data && (data.email || data.phone)) {
          setFetchedPrivateContact(data);
        }
      })
      .catch(() => {
        /* Fallback cleanly to public CV header when loopback lookup is unavailable */
      });

    return () => controller.abort();
  }, [localPrivateEnabled, privateContactProp]);

  const privateContact = privateContactProp ?? fetchedPrivateContact;

  function handleChange(next: CvView) {
    setView(next);
    persistCvView(next);
  }

  function handleTogglePhoto() {
    setShowPhoto((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.cvPhoto, String(next));
      } catch {
        /* Storage not available */
      }
      return next;
    });
  }

  const hasPrivateContact = Boolean(privateContact?.email?.trim() || privateContact?.phone?.trim());
  const pdfUrl = publicCvPdfUrl(locale, view, showPhoto);
  const pdfDownloadName = publicCvPdfDownloadName(locale, view, showPhoto);

  async function handleDownloadPdf(event: MouseEvent<HTMLAnchorElement>) {
    if (!hasPrivateContact) return;
    event.preventDefault();
    setPrivateDownloadError(null);
    const defaultError =
      privatePdfErrorLabel ?? 'Could not download the private CV PDF (run `pnpm run cv:pdf`).';
    try {
      const response = await fetch('/api/cv-pdf-local/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, view, photo: showPhoto }),
      });
      if (!response.ok) {
        let serverError = defaultError;
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) serverError = payload.error;
        } catch {
          /* Non-JSON error response */
        }
        setPrivateDownloadError(serverError);
        return;
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = pdfDownloadName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      setPrivateDownloadError(defaultError);
    }
  }

  return (
    <div
      data-cv-view={view}
      data-cv-photo={showPhoto ? 'true' : 'false'}
      className="flex flex-col gap-6 print:gap-1.5"
    >
      <AppearanceInit onView={setView} />
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CvViewSwitcher view={view} onChange={handleChange} labels={switcherLabels} />
        <div className="flex items-center gap-3">
          {downloadPdfLabel && (
            <a
              href={pdfUrl}
              download={pdfDownloadName}
              onClick={handleDownloadPdf}
              aria-label={downloadPdfLabel}
              title={downloadPdfLabel}
              className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'no-print')}
            >
              <svg
                viewBox="0 0 24 24"
                width={15}
                height={15}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="shrink-0"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="hidden sm:inline">{downloadPdfLabel}</span>
            </a>
          )}
          {printLabel && <PrintButton label={printLabel} />}
          {shareLabels && <ShareViewButton view={view} labels={shareLabels} />}
          {shareSlot}
        </div>
      </div>
      {privateDownloadError && (
        <div
          role="alert"
          className="no-print flex flex-wrap items-center justify-between gap-2 rounded-control border border-danger/40 bg-surface px-3 py-2 text-xs text-danger"
        >
          <span>{privateDownloadError}</span>
          <a
            href={pdfUrl}
            download={pdfDownloadName}
            className="font-medium underline text-accent hover:text-accent-hover"
          >
            {privatePdfFallbackLabel ?? 'Download public PDF'}
          </a>
        </div>
      )}
      <CvHeader
        locale={locale}
        privateContact={privateContact}
        showPhoto={showPhoto}
        onTogglePhoto={handleTogglePhoto}
        showPhotoLabel={strings.showPhoto}
        hidePhotoLabel={strings.hidePhoto}
        contactFormLabel={strings.contactForm}
      />
      {view === 'standard' && <CvStandard locale={locale} strings={strings} />}
      {view === 'compact' && <CvCompact locale={locale} strings={strings} />}
      {view === 'timeline' && <CvTimeline locale={locale} strings={strings} />}
    </div>
  );
}
