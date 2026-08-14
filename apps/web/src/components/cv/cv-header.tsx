'use client';

import { useState } from 'react';
import { profile } from '@/data/profile';
import type { Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

type CvHeaderProps = {
  locale: Locale;
  showBriefLabel?: string;
  hideBriefLabel?: string;
};

/**
 * Cabecera principal del CV (pantalla e impresión):
 * - Muestra el nombre grande ("Nico Behm") y el titular profesional.
 * - Muestra los links de contacto públicos (GitHub, LinkedIn) y el acceso al formulario de contacto.
 * - Toggle interactivo con animación suave para ver/ocultar el resumen/brief profesional.
 * - Respeta estrictamente el estado del toggle en impresión (si está oculto, NO se imprime).
 */
export function CvHeader({
  locale,
  showBriefLabel = 'Mostrar resumen',
  hideBriefLabel = 'Ocultar resumen',
}: CvHeaderProps) {
  const [showBrief, setShowBrief] = useState(false);

  return (
    <header className="flex flex-col gap-2 border-b border-border pb-2.5 print:pb-1.5 print:gap-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:gap-1">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-fg print:text-2xl print:leading-tight">
            {profile.name}
          </h1>
          <p className="text-xl text-fg-muted print:text-xs font-medium">
            {profile.headline[locale]}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-fg-muted items-start print:text-[11px] print:gap-0.5">
          <div className="flex items-center gap-2 print:gap-1">
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
          <div className="flex items-center gap-2 print:gap-1">
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

      <div className="flex items-center justify-between no-print mt-1">
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
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{showBriefLabel}</span>
            </>
          )}
        </Button>
      </div>

      {/* Contenedor animado suavemente para el resumen profesional */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          showBrief
            ? 'grid-rows-[1fr] opacity-100 mt-1 mb-2 print:my-1'
            : 'grid-rows-[0fr] opacity-0 mt-0 mb-0 print:hidden'
        }`}
      >
        <div className="overflow-hidden">
          <div className="whitespace-pre-line text-sm text-fg leading-relaxed print:text-xs print:text-fg print:leading-snug">
            {profile.summary[locale]}
          </div>
        </div>
      </div>
    </header>
  );
}
