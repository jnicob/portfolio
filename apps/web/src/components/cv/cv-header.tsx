'use client';

import { useState } from 'react';
import Image from 'next/image';

import { profile } from '@/data/profile';

import type { Locale } from '@/i18n/routing';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/cn';
import { ProfileSummary } from '@/components/home/profile-summary';

type CvHeaderProps = {
  locale: Locale;
  showBriefLabel?: string;
  hideBriefLabel?: string;
  showPhotoLabel?: string;
  hidePhotoLabel?: string;
  photoSrc?: string;
};

/**
 * Main CV Header (Screen and Print):
 * - Displays prominent name ("Nico Behm") and professional headline.
 * - Supports an optional profile photo (interactive toggle, off by default for ATS).
 * - Displays public contact links (GitHub, LinkedIn, Website, Contact form).
 * - Provides interactive toggles for brief and photo customization.
 * - Strictly preserves toggle state in @media print.
 */
export function CvHeader({
  locale,
  showBriefLabel = 'Mostrar resumen',
  hideBriefLabel = 'Ocultar resumen',
  showPhotoLabel = 'Incluir foto',
  hidePhotoLabel = 'Quitar foto',
  photoSrc = '/profile/avatar-cv.jpg',
}: CvHeaderProps) {
  const [showBrief, setShowBrief] = useState(true);
  const [showPhoto, setShowPhoto] = useState(false);

  const displayName = profile.fullName ? profile.fullName[locale] : profile.name;

  return (
    <header className="flex flex-col gap-2 border-b border-border pb-2.5 print:gap-1.5">
      <div
        className={cn(
          'flex flex-col pb-2.5 gap-4 sm:flex-row sm:items-start sm:justify-between',
          showBrief && 'border-b border-border',
        )}
      >
        <div className="flex items-center min-w-0">
          <div
            aria-hidden={!showPhoto}
            className={cn(
              'shrink-0 grid transition-[grid-template-columns,margin,opacity] duration-300 ease-out',
              showPhoto
                ? 'grid-cols-[1fr] opacity-100 mr-4 sm:mr-6 print:mr-4'
                : 'grid-cols-[0fr] opacity-0 mr-0 pointer-events-none print:hidden',
            )}
          >
            <div className="overflow-hidden">
              <div
                data-testid={showPhoto ? 'cv-photo' : undefined}
                className={cn(
                  'shrink-0 aspect-square w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 overflow-hidden rounded-full border-2 border-border/80 shadow-md ring-4 ring-accent/10 transition-transform duration-300 ease-out print:ring-0 print:border-border print:w-24 print:h-24 print:shadow-none',
                  showPhoto ? 'scale-100' : 'scale-90',
                )}
              >
                <Image
                  src={photoSrc}
                  alt={displayName}
                  width={144}
                  height={144}
                  unoptimized
                  className="h-full w-full object-cover rounded-full select-none print:scale-120 print:origin-top"
                />
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-5xl font-bold tracking-tight text-fg print:text-4xl">
              {displayName}
            </h1>
            <p className="text-xl text-fg-muted print:text-lg print:font-semibold print:text-fg font-medium">
              {profile.headline[locale]}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-fg-muted items-start">
          {profile.links.website && (
            <div className="flex items-center gap-2">
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
                className="shrink-0 text-fg-muted print:text-fg"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <a
                href={profile.links.website}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline print:text-fg print:underline"
              >
                {profile.links.website}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
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
              className="shrink-0 text-fg-muted print:text-fg"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline print:text-fg print:underline"
            >
              {profile.links.github}
            </a>
          </div>
          <div className="flex items-center gap-2">
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
              className="shrink-0 text-fg-muted print:text-fg"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline print:text-fg print:underline"
            >
              {profile.links.linkedin}
            </a>
          </div>
          <div className="flex items-center gap-2 no-print">
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
              className="shrink-0 text-fg-muted"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`/${locale}/contact`} className="text-accent hover:underline font-medium">
              {locale === 'es' ? 'Formulario de contacto' : 'Contact form'}
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 no-print mt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBrief((prev) => !prev)}
          className="text-xs text-fg-muted hover:text-fg flex items-center gap-1.5 px-2 h-7"
        >
          {showBrief ? (
            <>
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="shrink-0"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <span>{hideBriefLabel}</span>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="shrink-0"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span>{showBriefLabel}</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPhoto((prev) => !prev)}
          className="text-xs text-fg-muted hover:text-fg flex items-center gap-1.5 px-2 h-7"
        >
          {showPhoto ? (
            <>
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="shrink-0"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>{hidePhotoLabel}</span>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="shrink-0"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>{showPhotoLabel}</span>
            </>
          )}
        </Button>
      </div>

      {/* Smooth animated accordion container for the professional brief */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          showBrief
            ? 'mt-1 mb-2 grid-rows-[1fr] opacity-100 print:my-1'
            : 'my-0 grid-rows-[0fr] opacity-0 print:hidden',
        )}
      >
        <div className="overflow-hidden">
          <ProfileSummary summary={profile.summary} locale={locale} variant="cv" />
        </div>
      </div>
    </header>
  );
}
