import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Canonical matrix of pre-generated CV PDFs (Option B: 2 locales × 2 ATS views × 2 photo modes = 8 PDFs)
 * with their A4 page budget and localized content assertions.
 */
export const CV_PUBLIC_PDF_SPECS = [
  {
    locale: 'es',
    view: 'compact',
    photo: false,
    expectedPages: 1,
    expectedLocalizedHeading: 'Experiencia',
    expectedLocalizedLanguage: 'Español: Nativo',
  },
  {
    locale: 'es',
    view: 'compact',
    photo: true,
    expectedPages: 1,
    expectedLocalizedHeading: 'Experiencia',
    expectedLocalizedLanguage: 'Español: Nativo',
  },
  {
    locale: 'es',
    view: 'standard',
    photo: false,
    expectedPages: 2,
    expectedLocalizedHeading: 'Experiencia',
    expectedLocalizedLanguage: 'Español: Nativo',
  },
  {
    locale: 'es',
    view: 'standard',
    photo: true,
    expectedPages: 2,
    expectedLocalizedHeading: 'Experiencia',
    expectedLocalizedLanguage: 'Español: Nativo',
  },
  {
    locale: 'en',
    view: 'compact',
    photo: false,
    expectedPages: 1,
    expectedLocalizedHeading: 'Experience',
    expectedLocalizedLanguage: 'Spanish: Native',
  },
  {
    locale: 'en',
    view: 'compact',
    photo: true,
    expectedPages: 1,
    expectedLocalizedHeading: 'Experience',
    expectedLocalizedLanguage: 'Spanish: Native',
  },
  {
    locale: 'en',
    view: 'standard',
    photo: false,
    expectedPages: 2,
    expectedLocalizedHeading: 'Experience',
    expectedLocalizedLanguage: 'Spanish: Native',
  },
  {
    locale: 'en',
    view: 'standard',
    photo: true,
    expectedPages: 2,
    expectedLocalizedHeading: 'Experience',
    expectedLocalizedLanguage: 'Spanish: Native',
  },
];

/**
 * Relative paths (from repository root) whose contents affect CV PDF output.
 * Any change to these files invalidates `apps/web/public/cv/manifest.json`
 * until `pnpm run cv:pdf` is re-run.
 */
export const CV_INPUT_FILES = [
  'apps/web/messages/es.json',
  'apps/web/messages/en.json',
  'apps/web/public/profile/avatar-cv.jpg',
  'apps/web/src/app/[locale]/layout.tsx',
  'apps/web/src/app/[locale]/cv/page.tsx',
  'apps/web/src/app/globals.css',
  'apps/web/src/app/skins/editorial.css',
  'apps/web/src/components/cv/cv-compact.tsx',
  'apps/web/src/components/cv/cv-content.tsx',
  'apps/web/src/components/cv/cv-header.tsx',
  'apps/web/src/components/cv/cv-standard.tsx',
  'apps/web/src/components/cv/cv-timeline.tsx',
  'apps/web/src/components/cv/education-list.tsx',
  'apps/web/src/components/cv/experience-entry.tsx',
  'apps/web/src/components/cv/language-list.tsx',
  'apps/web/src/components/cv/skill-group.tsx',
  'apps/web/src/components/cv/skill-level.tsx',
  'apps/web/src/components/home/profile-summary.tsx',
  'apps/web/src/data/constants.ts',
  'apps/web/src/data/education.ts',
  'apps/web/src/data/experience.ts',
  'apps/web/src/data/languages.ts',
  'apps/web/src/data/profile.ts',
  'apps/web/src/data/projects.ts',
  'apps/web/src/data/skills.ts',
];

const BINARY_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

/**
 * Returns the canonical public PDF filename stored in `apps/web/public/cv/`.
 */
export function publicPdfFilename(locale, view, photo = false) {
  return `nico-behm-cv-${locale}-${view}${photo ? '-photo' : ''}.pdf`;
}

/**
 * Returns the local private PDF filename stored in gitignored `apps/web/content/cv/pdf/`.
 */
export function privatePdfFilename(locale, view, photo = false) {
  return `Nico-Behm-CV-${locale.toUpperCase()}-${view}${photo ? '-photo' : ''}.pdf`;
}

/**
 * Computes the SHA-256 hex digest of a file's raw bytes.
 */
export function computeFileSha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

/**
 * Computes a deterministic SHA-256 fingerprint across all CV source inputs
 * (normalizing LF line endings for text sources so checks are OS-independent).
 */
export function computeCvInputHash(repoRoot) {
  const hash = createHash('sha256');
  for (const relPath of CV_INPUT_FILES) {
    const absPath = path.join(repoRoot, relPath);
    hash.update(`${relPath}\0`);
    if (BINARY_EXTENSIONS.has(path.extname(relPath).toLowerCase())) {
      hash.update(readFileSync(absPath));
    } else {
      const normalized = readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n');
      hash.update(normalized);
    }
    hash.update('\0');
  }
  return hash.digest('hex');
}
