import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CV_PUBLIC_PDF_SPECS,
  computeCvInputHash,
  computeFileSha256,
  publicPdfFilename,
} from '../../../../../scripts/cv-pdf-config.mjs';

const REPO_ROOT = path.resolve(__dirname, '../../../../..');
const PUBLIC_CV_DIR = path.join(REPO_ROOT, 'apps/web/public/cv');
const MANIFEST_PATH = path.join(PUBLIC_CV_DIR, 'manifest.json');

const EMAIL_IN_TEXT = /[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_IN_TEXT = /\+?(?:\d[\s().-]?){9,}/;

function isCommandAvailable(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const hasPdfInfo = isCommandAvailable('pdfinfo');
const hasPdfToText = isCommandAvailable('pdftotext');

describe('Pre-generated public CV PDFs (freshness, A4 budget, and PII guard)', () => {
  it('manifest.json exists and matches the current CV source hash (run `pnpm run cv:pdf` when CV changes)', () => {
    expect(existsSync(MANIFEST_PATH), 'Missing apps/web/public/cv/manifest.json').toBe(true);
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as {
      inputHash: string;
      files: string[];
      checksums: Record<string, string>;
    };
    const expectedHash = computeCvInputHash(REPO_ROOT);
    expect(
      manifest.inputHash,
      'Public CV PDFs are stale — run `pnpm run cv:pdf` before committing/pushing',
    ).toBe(expectedHash);

    const expectedFiles = CV_PUBLIC_PDF_SPECS.map((spec) =>
      publicPdfFilename(spec.locale, spec.view, spec.photo),
    );
    expect(manifest.files).toEqual(expectedFiles);
    const actualEntries = readdirSync(PUBLIC_CV_DIR).sort();
    expect(actualEntries).toEqual(['manifest.json', ...expectedFiles].sort());
    for (const filename of expectedFiles) {
      const pdfPath = path.join(PUBLIC_CV_DIR, filename);
      expect(manifest.checksums?.[filename]).toBe(computeFileSha256(pdfPath));
    }
  });

  it.each(CV_PUBLIC_PDF_SPECS)(
    'public PDF for $locale/$view (photo=$photo) exists, is valid A4 ($expectedPages page(s)), localized, and free of PII',
    ({
      locale,
      view,
      photo,
      expectedPages,
      expectedLocalizedHeading,
      expectedLocalizedLanguage,
    }) => {
      const filename = publicPdfFilename(locale, view, photo);
      const pdfPath = path.join(PUBLIC_CV_DIR, filename);

      expect(existsSync(pdfPath), `Missing public PDF: ${filename}`).toBe(true);
      const header = readFileSync(pdfPath).subarray(0, 5).toString('utf8');
      expect(header).toBe('%PDF-');

      if (hasPdfInfo) {
        const info = execSync(`pdfinfo "${pdfPath}"`, { encoding: 'utf8' });
        const pagesMatch = info.match(/Pages:\s+(\d+)/);
        expect(Number(pagesMatch?.[1])).toBe(expectedPages);
        expect(info).toContain('A4');
      }

      if (hasPdfToText) {
        const text = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf8' });
        expect(text).toContain(expectedLocalizedHeading);
        expect(text).toContain(expectedLocalizedLanguage);
        expect(text).toContain('Freelance');
        expect(text).toContain('2026-08');
        if (view !== 'compact') {
          expect(text).toContain('Lauquen Transporte');
          expect(text).toContain('Hotel Monte Cervino');
          expect(text).toContain('Manos Activas');
        }
        expect(text).not.toContain('@nicobehm/media-kit');
        expect(text).not.toContain('279');
        expect(text).toContain('github.com/jnicob');
        expect(text).not.toMatch(EMAIL_IN_TEXT);
        expect(text).not.toMatch(PHONE_IN_TEXT);
      }
    },
  );
});
