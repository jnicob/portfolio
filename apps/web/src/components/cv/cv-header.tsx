'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { profile } from '@/data/profile';
import { STORAGE_KEYS } from '@/lib/appearance';

import type { Locale } from '@/i18n/routing';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/cn';
import { ProfileSummary } from '@/components/home/profile-summary';

export type CvPrivateContact = {
  email?: string;
  phone?: string;
};

type CvHeaderProps = {
  locale: Locale;
  privateContact?: CvPrivateContact;
  /** Controlled photo visibility (owned by CvContent so Download PDF stays in sync). */
  showPhoto?: boolean;
  onTogglePhoto?: () => void;
  showPhotoLabel?: string;
  hidePhotoLabel?: string;
  contactFormLabel?: string;
  photoSrc?: string;
};

/**
 * Strips scheme, optional `www.` prefix, and trailing slash for compact display
 * while keeping the full canonical URL in `href`.
 */
function formatDisplayUrl(url: string): string {
  return url.replace(/^https?:\/\/(?:www\.)?/, '').replace(/\/$/, '');
}

/**
 * Main CV Header (Screen and Print):
 * - Left column: optional avatar, full name, professional headline, and location (when private contact is present).
 * - Right column: optional local-only email/phone (never bundled in prod), shortened public links, and location (public mode).
 * - Always displays the professional summary (ATS keywords & Core Tech).
 * - Provides an optional profile photo toggle (off by default for international ATS).
 */
export function CvHeader({
  locale,
  privateContact,
  showPhoto: controlledShowPhoto,
  onTogglePhoto,
  showPhotoLabel = 'Incluir foto',
  hidePhotoLabel = 'Quitar foto',
  contactFormLabel,
  photoSrc = '/profile/avatar-cv.jpg',
}: CvHeaderProps) {
  const [uncontrolledShowPhoto, setUncontrolledShowPhoto] = useState(false);
  const isControlled = controlledShowPhoto !== undefined;
  const showPhoto = isControlled ? controlledShowPhoto : uncontrolledShowPhoto;

  useEffect(() => {
    if (isControlled) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.cvPhoto);
      if (stored !== null) {
        setUncontrolledShowPhoto(stored === 'true');
      }
    } catch {
      /* Storage not available (e.g. private browsing mode) */
    }
  }, [isControlled]);

  const handleTogglePhoto = () => {
    if (onTogglePhoto) {
      onTogglePhoto();
      return;
    }
    setUncontrolledShowPhoto((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.cvPhoto, String(next));
      } catch {
        /* Storage not available */
      }
      return next;
    });
  };

  const displayName = profile.fullName ? profile.fullName[locale] : profile.name;
  const email = privateContact?.email?.trim() || undefined;
  const phone = privateContact?.phone?.trim() || undefined;
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined;
  const hasPrivateContact = Boolean(email || phone);

  const locationNode = profile.location ? (
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
        className="shrink-0 text-fg-muted print:text-fg"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <span className="whitespace-nowrap">{profile.location[locale]}</span>
    </>
  ) : null;

  return (
    <header className="flex flex-col gap-2 border-b border-border pb-2.5 print:gap-1.5">
      <div className="flex flex-col border-b border-border pb-2.5 gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            <p className="text-xl text-fg-muted print:text-base print:font-semibold print:text-fg font-medium">
              {profile.headline[locale]}
            </p>
            {hasPrivateContact && locationNode && (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-fg-muted print:mt-0.5 print:text-xs print:text-fg">
                {locationNode}
              </div>
            )}
          </div>
        </div>
        <div
          data-testid="cv-contact-column"
          className="shrink-0 flex flex-col gap-1.5 text-sm text-fg-muted items-start print:gap-0.5 print:text-xs"
        >
          {!hasPrivateContact && locationNode && (
            <div className="flex items-center gap-2 text-fg-muted print:text-fg">
              {locationNode}
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2">
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
                className="shrink-0 text-fg-muted print:text-fg"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a
                href={`mailto:${email}`}
                className="text-accent hover:underline print:text-fg print:underline whitespace-nowrap"
              >
                {email}
              </a>
            </div>
          )}
          {phone && phoneHref && (
            <div className="flex items-center gap-2">
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
                className="shrink-0 text-fg-muted print:text-fg"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a
                href={phoneHref}
                className="text-accent hover:underline print:text-fg print:underline whitespace-nowrap"
              >
                {phone}
              </a>
            </div>
          )}
          {profile.links.website && (
            <div className="flex items-center gap-2">
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
                className="text-accent hover:underline print:text-fg print:underline whitespace-nowrap"
              >
                {formatDisplayUrl(profile.links.website)}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
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
              className="shrink-0 text-fg-muted print:text-fg"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline print:text-fg print:underline whitespace-nowrap"
            >
              {formatDisplayUrl(profile.links.github)}
            </a>
          </div>
          <div className="flex items-center gap-2">
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
              className="text-accent hover:underline print:text-fg print:underline whitespace-nowrap"
            >
              {formatDisplayUrl(profile.links.linkedin)}
            </a>
          </div>
          <div className="flex items-center gap-2 no-print">
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
              className="shrink-0 text-fg-muted"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`/${locale}/contact`} className="text-accent hover:underline font-medium">
              {contactFormLabel ?? (locale === 'es' ? 'Formulario de contacto' : 'Contact form')}
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 no-print mt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePhoto}
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

      <div className="mt-1 mb-2 print:my-1">
        <ProfileSummary summary={profile.summary} locale={locale} variant="cv" />
      </div>
    </header>
  );
}
