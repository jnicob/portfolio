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

function getPdfPageCount(pdfPath: string): number {
  const output = execSync(`pdfinfo "${pdfPath}"`, { encoding: 'utf-8' });
  const match = output.match(/Pages:\s+(\d+)/);
  if (!match || !match[1]) {
    throw new Error(`Failed to parse page count from pdfinfo: ${output}`);
  }
  return parseInt(match[1], 10);
}

const canRunPdfTests =
  isCommandAvailable('google-chrome') &&
  isCommandAvailable('pdfinfo') &&
  isServerRunning('http://localhost:3000/es/cv');

describe('CV Print Page Limits (PDF validation)', () => {
  it.skipIf(!canRunPdfTests)(
    'cv compact produces exactly 1 page in print',
    () => {
      const pdfPath = join(tmpdir(), `test_cv_compact_${Date.now()}.pdf`);
      try {
        execSync(
          `google-chrome --headless --disable-gpu --virtual-time-budget=4000 --print-to-pdf="${pdfPath}" "http://localhost:3000/es/cv?view=compact"`,
          { stdio: 'ignore' },
        );
        expect(existsSync(pdfPath)).toBe(true);
        const pages = getPdfPageCount(pdfPath);
        expect(pages).toBe(1);
      } finally {
        if (existsSync(pdfPath)) unlinkSync(pdfPath);
      }
    },
    15000,
  );

  it.skipIf(!canRunPdfTests)(
    'cv standard produces exactly 2 pages in print',
    () => {
      const pdfPath = join(tmpdir(), `test_cv_standard_${Date.now()}.pdf`);
      try {
        execSync(
          `google-chrome --headless --disable-gpu --virtual-time-budget=4000 --print-to-pdf="${pdfPath}" "http://localhost:3000/es/cv?view=standard"`,
          { stdio: 'ignore' },
        );
        expect(existsSync(pdfPath)).toBe(true);
        const pages = getPdfPageCount(pdfPath);
        expect(pages).toBe(2);
      } finally {
        if (existsSync(pdfPath)) unlinkSync(pdfPath);
      }
    },
    15000,
  );

  it.skipIf(!canRunPdfTests)(
    'cv timeline produces exactly 2 pages in print',
    () => {
      const pdfPath = join(tmpdir(), `test_cv_timeline_${Date.now()}.pdf`);
      try {
        execSync(
          `google-chrome --headless --disable-gpu --virtual-time-budget=4000 --print-to-pdf="${pdfPath}" "http://localhost:3000/es/cv?view=timeline"`,
          { stdio: 'ignore' },
        );
        expect(existsSync(pdfPath)).toBe(true);
        const pages = getPdfPageCount(pdfPath);
        expect(pages).toBe(2);
      } finally {
        if (existsSync(pdfPath)) unlinkSync(pdfPath);
      }
    },
    15000,
  );
});
