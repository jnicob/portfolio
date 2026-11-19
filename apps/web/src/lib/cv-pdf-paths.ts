import type { CvView } from '@/data/constants';
import type { Locale } from '@/i18n/routing';

type PdfView = 'compact' | 'standard';

function resolvePdfView(view: CvView): PdfView {
  return view === 'compact' ? 'compact' : 'standard';
}

/**
 * Returns the public static URL path for a pre-generated CV PDF.
 * Pure, client-safe helper with zero server/Node dependencies.
 * `timeline` falls back to `standard` while preserving the active photo preference.
 */
export function publicCvPdfUrl(locale: Locale, view: CvView, withPhoto = false): string {
  const pdfView = resolvePdfView(view);
  const photoSuffix = withPhoto ? '-photo' : '';
  return `/cv/nico-behm-cv-${locale}-${pdfView}${photoSuffix}.pdf`;
}

/**
 * Returns a clean human-friendly filename for the browser `download` attribute.
 */
export function publicCvPdfDownloadName(locale: Locale, view: CvView, withPhoto = false): string {
  const pdfView = resolvePdfView(view);
  const photoSuffix = withPhoto ? '-photo' : '';
  return `Nico-Behm-CV-${locale.toUpperCase()}-${pdfView}${photoSuffix}.pdf`;
}
