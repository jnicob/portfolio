import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CV_VIEWS } from '@/data/constants';
import { publicCvPdfDownloadName } from '@/lib/cv-pdf-paths';
import { isLocalPrivateCvAuthorized } from '@/lib/local-private-cv';

const pdfRequestSchema = z.object({
  mode: z.literal('pdf').optional(),
  locale: z.enum(['es', 'en']),
  view: z.enum(CV_VIEWS),
  photo: z.boolean().default(false),
});

const contactRequestSchema = z.object({
  mode: z.literal('contact'),
});

const requestSchema = z.union([contactRequestSchema, pdfRequestSchema]);

function resolvePrivatePdfDir(): string {
  const cwd = process.cwd();
  const direct = path.join(cwd, 'content/cv/pdf');
  if (existsSync(direct)) return direct;
  return path.join(cwd, 'apps/web/content/cv/pdf');
}

/**
 * Local-development-only endpoint that serves private CV contact metadata and
 * gitignored private CV PDFs (`CV_EMAIL` / `CV_PHONE`) strictly to loopback requests.
 *
 * Uses POST so Next.js `output: 'export'` ignores it during static production builds,
 * and strictly returns 404 unless `NODE_ENV === 'development'`, `CV_INCLUDE_PRIVATE === 'true'`,
 * and the request targets loopback (`localhost` / `127.0.0.1` / `::1`).
 */
export async function POST(request: Request) {
  if (!isLocalPrivateCvAuthorized(request.headers, request.url)) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid CV PDF parameters' }, { status: 400 });
  }

  if (parsed.data.mode === 'contact') {
    return NextResponse.json(
      {
        email: process.env.CV_EMAIL?.trim() || undefined,
        phone: process.env.CV_PHONE?.trim() || undefined,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const { locale, view, photo } = parsed.data;
  const filename = publicCvPdfDownloadName(locale, view, photo);
  const baseDir = process.env.CV_PRIVATE_PDF_DIR || resolvePrivatePdfDir();
  const filePath = path.join(baseDir, filename);

  try {
    const bytes = await readFile(filePath);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Private PDF not generated yet. Run `pnpm run cv:pdf`.' },
      { status: 404 },
    );
  }
}
