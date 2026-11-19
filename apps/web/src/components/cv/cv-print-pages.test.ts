import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function isCommandAvailable(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isServerRunning(url: string): boolean {
  try {
    const status = execSync(`curl -sL -o /dev/null -w "%{http_code}" "${url}"`, {
      timeout: 2000,
      encoding: 'utf-8',
    });
    return status.trim() === '200';
  } catch {
    return false;
  }
}

function getPdfInfo(pdfPath: string): { pages: number; pageSize: string } {
  const output = execSync(`pdfinfo "${pdfPath}"`, { encoding: 'utf-8' });
  const pagesMatch = output.match(/Pages:\s+(\d+)/);
  const sizeMatch = output.match(/Page size:\s+(.+)/);
  if (!pagesMatch || !pagesMatch[1]) {
    throw new Error(`Failed to parse page count from pdfinfo: ${output}`);
  }
  return {
    pages: parseInt(pagesMatch[1], 10),
    pageSize: sizeMatch?.[1]?.trim() ?? '',
  };
}

const hasPdfToText = isCommandAvailable('pdftotext');

const canRunPdfTests =
  isCommandAvailable('google-chrome') &&
  isCommandAvailable('pdfinfo') &&
  isServerRunning('http://localhost:3000/es/cv');

const VIEW_EXPECTATIONS = [
  {
    locale: 'es',
    view: 'compact',
    expectedPages: 1,
    expectedLocalizedHeading: 'Experiencia',
    expectedLocalizedLanguage: 'Español: Nativo',
  },
  {
    locale: 'es',
    view: 'standard',
    expectedPages: 2,
    expectedLocalizedHeading: 'Experiencia',
    expectedLocalizedLanguage: 'Español: Nativo',
  },
  {
    locale: 'es',
    view: 'timeline',
    expectedPages: 2,
    expectedLocalizedHeading: 'Experiencia',
    expectedLocalizedLanguage: 'Español: Nativo',
  },
  {
    locale: 'en',
    view: 'compact',
    expectedPages: 1,
    expectedLocalizedHeading: 'Experience',
    expectedLocalizedLanguage: 'Spanish: Native',
  },
  {
    locale: 'en',
    view: 'standard',
    expectedPages: 2,
    expectedLocalizedHeading: 'Experience',
    expectedLocalizedLanguage: 'Spanish: Native',
  },
  {
    locale: 'en',
    view: 'timeline',
    expectedPages: 2,
    expectedLocalizedHeading: 'Experience',
    expectedLocalizedLanguage: 'Spanish: Native',
  },
] as const;

describe('CV Print Page Limits (PDF validation)', () => {
  it.skipIf(!canRunPdfTests).each(VIEW_EXPECTATIONS)(
    '$locale cv $view produces exactly $expectedPages page(s) in A4 print',
    ({ locale, view, expectedPages, expectedLocalizedHeading, expectedLocalizedLanguage }) => {
      const pdfPath = join(tmpdir(), `test_cv_${locale}_${view}_${Date.now()}.pdf`);
      try {
        execSync(
          `google-chrome --headless --disable-gpu --virtual-time-budget=4000 --print-to-pdf="${pdfPath}" "http://localhost:3000/${locale}/cv?view=${view}"`,
          { stdio: 'ignore' },
        );
        expect(existsSync(pdfPath)).toBe(true);
        const { pages, pageSize } = getPdfInfo(pdfPath);
        expect(pages).toBe(expectedPages);
        expect(pageSize).toContain('A4');
        if (hasPdfToText) {
          const text = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf-8' });
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
          expect(text).toContain('B2 Upper Intermediate');
        }
      } finally {
        if (existsSync(pdfPath)) unlinkSync(pdfPath);
      }
    },
    15000,
  );
});
