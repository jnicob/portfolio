import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CV_PUBLIC_PDF_SPECS,
  computeCvInputHash,
  computeFileSha256,
  privatePdfFilename,
  publicPdfFilename,
} from './cv-pdf-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(REPO_ROOT, 'apps/web');
const ISOLATED_DIST_DIR = '.next-cv-pdf';
const ISOLATED_DIST_PATH = path.join(WEB_DIR, ISOLATED_DIST_DIR);
const NEXT_ENV_DTS_PATH = path.join(WEB_DIR, 'next-env.d.ts');
const PUBLIC_CV_DIR = path.join(WEB_DIR, 'public/cv');
const PRIVATE_CV_DIR = path.join(WEB_DIR, 'content/cv/pdf');
const ENV_LOCAL_PATH = path.join(WEB_DIR, '.env.local');
const MANIFEST_PATH = path.join(PUBLIC_CV_DIR, 'manifest.json');

const EMAIL_IN_TEXT = /[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_IN_TEXT = /\+?(?:\d[\s().-]?){9,}/;

function findCommand(candidates) {
  for (const cmd of candidates) {
    try {
      const resolved = execFileSync('which', [cmd], { encoding: 'utf8' }).trim();
      if (resolved) return resolved;
    } catch {
      // Try next candidate
    }
  }
  return null;
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const result = {};
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Could not allocate ephemeral TCP port')));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = 'unreachable';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.status === 200) return;
      lastStatus = `HTTP ${res.status}`;
    } catch (err) {
      lastStatus = err instanceof Error ? err.message : String(err);
    }
    await sleep(400);
  }
  throw new Error(`Timed out waiting for Next.js dev server at ${url} (last: ${lastStatus})`);
}

async function stopProcessGroup(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolve) => child.once('exit', resolve));
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    // Process may already have exited
  }
  const raced = await Promise.race([exited.then(() => true), sleep(3500).then(() => false)]);
  if (!raced) {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      // Already exited
    }
    await Promise.race([exited, sleep(1000)]);
  }
  // Brief pause so Next.js releases .next/dev/lock before any second pass
  await sleep(300);
}

async function startWebServer(port, envOverrides) {
  const child = spawn('pnpm', ['--filter', 'web', 'dev', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: REPO_ROOT,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NEXT_DIST_DIR: ISOLATED_DIST_DIR,
      ...envOverrides,
    },
  });

  let stderrTail = '';
  child.stdout?.on('data', (chunk) => {
    stderrTail = (stderrTail + chunk.toString('utf8')).slice(-3000);
  });
  child.stderr.on('data', (chunk) => {
    stderrTail = (stderrTail + chunk.toString('utf8')).slice(-3000);
  });

  const earlyExit = new Promise((_, reject) => {
    child.once('exit', (code, signal) => {
      reject(
        new Error(
          `Next.js dev server exited prematurely (code=${code}, signal=${signal}).\n${stderrTail}`,
        ),
      );
    });
  });

  try {
    await Promise.race([waitForServer(`http://localhost:${port}/es/cv/`), earlyExit]);
    // Warm up English route as well so Chrome renders deterministically
    await fetch(`http://localhost:${port}/en/cv/`);
    return child;
  } catch (err) {
    await stopProcessGroup(child);
    throw new Error(
      `${err instanceof Error ? err.message : String(err)}\n--- server output ---\n${stderrTail}`,
    );
  }
}

function validateGeneratedPdf({ pdfPath, spec, isPublic, privateContact }) {
  if (!existsSync(pdfPath)) {
    throw new Error(`Expected PDF was not created: ${pdfPath}`);
  }
  const header = readFileSync(pdfPath).subarray(0, 5).toString('utf8');
  if (header !== '%PDF-') {
    throw new Error(`Invalid PDF header in ${pdfPath}`);
  }

  const info = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' });
  const pagesMatch = info.match(/Pages:\s+(\d+)/);
  const pages = Number(pagesMatch?.[1]);
  if (pages !== spec.expectedPages) {
    throw new Error(
      `${path.basename(pdfPath)}: expected ${spec.expectedPages} A4 page(s), got ${pages}`,
    );
  }
  if (!info.includes('A4')) {
    throw new Error(`${path.basename(pdfPath)}: page size is not A4`);
  }

  const text = execFileSync('pdftotext', [pdfPath, '-'], { encoding: 'utf8' });
  const requiredSnippets = [
    spec.expectedLocalizedHeading,
    spec.expectedLocalizedLanguage,
    'Freelance',
    '2026-08',
    'github.com/jnicob',
    ...(spec.view === 'compact'
      ? []
      : ['Lauquen Transporte', 'Hotel Monte Cervino', 'Manos Activas']),
  ];
  for (const required of requiredSnippets) {
    if (!text.includes(required)) {
      throw new Error(`${path.basename(pdfPath)}: missing expected text "${required}"`);
    }
  }
  for (const forbidden of ['@nicobehm/media-kit', '279']) {
    if (text.includes(forbidden)) {
      throw new Error(`${path.basename(pdfPath)}: contains unexpected text "${forbidden}"`);
    }
  }

  if (isPublic) {
    const normalizedDigits = privateContact.phone ? privateContact.phone.replace(/\D/g, '') : '';
    const textDigits = text.replace(/\D/g, '');
    const leaked =
      EMAIL_IN_TEXT.test(text) ||
      PHONE_IN_TEXT.test(text) ||
      (privateContact.email && text.toLowerCase().includes(privateContact.email.toLowerCase())) ||
      (normalizedDigits.length >= 7 && textDigits.includes(normalizedDigits));
    if (leaked) {
      throw new Error(
        `PII GUARD FAILURE: ${path.basename(pdfPath)} contains email/phone contact data!`,
      );
    }
  } else {
    if (privateContact.email && !text.includes(privateContact.email)) {
      throw new Error(
        `${path.basename(pdfPath)}: expected CV_EMAIL from .env.local to appear in private PDF`,
      );
    }
    if (privateContact.phone && !text.includes(privateContact.phone)) {
      throw new Error(
        `${path.basename(pdfPath)}: expected CV_PHONE from .env.local to appear in private PDF`,
      );
    }
  }
}

async function waitForClientHydration(chromeBin, port, privateContact, isPublic) {
  const probeUrl = `http://localhost:${port}/es/cv?view=compact&photo=1&skin=dev-tool`;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const dom = execFileSync(
        chromeBin,
        ['--headless', '--disable-gpu', '--virtual-time-budget=8000', '--dump-dom', probeUrl],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      );
      const hydrated =
        dom.includes('data-cv-view="compact"') && dom.includes('data-cv-photo="true"');
      const privateReady =
        isPublic || !privateContact.email || dom.includes(`mailto:${privateContact.email}`);
      if (hydrated && privateReady) {
        return;
      }
    } catch {
      // Retry warm-up probe while Next.js finishes compiling client chunks
    }
    await sleep(500);
  }
  throw new Error(
    'Timed out waiting for client hydration of /es/cv?view=compact&photo=1 before PDF generation.',
  );
}

async function generatePass({ chromeBin, label, isPublic, outDir, manifestPath, privateContact }) {
  mkdirSync(outDir, { recursive: true });
  let previouslyManagedFiles = [];
  if (manifestPath && existsSync(manifestPath)) {
    try {
      const prev = JSON.parse(readFileSync(manifestPath, 'utf8'));
      if (Array.isArray(prev?.files)) {
        previouslyManagedFiles = prev.files.filter((f) => typeof f === 'string');
      }
    } catch {
      // Ignore corrupt prior manifest
    }
  }

  const port = await getFreePort();
  const envOverrides = isPublic
    ? {
        CV_INCLUDE_PRIVATE: 'false',
        CV_EMAIL: '',
        CV_PHONE: '',
      }
    : {
        CV_INCLUDE_PRIVATE: 'true',
        CV_EMAIL: privateContact.email ?? '',
        CV_PHONE: privateContact.phone ?? '',
      };

  console.log(`\n[${label}] Starting local Next.js server on port ${port}...`);
  const server = await startWebServer(port, envOverrides);

  try {
    await waitForClientHydration(chromeBin, port, privateContact, isPublic);
    const generatedFiles = [];
    for (const spec of CV_PUBLIC_PDF_SPECS) {
      const filename = isPublic
        ? publicPdfFilename(spec.locale, spec.view, spec.photo)
        : privatePdfFilename(spec.locale, spec.view, spec.photo);
      const outPath = path.join(outDir, filename);
      const url = `http://localhost:${port}/${spec.locale}/cv?view=${spec.view}&photo=${spec.photo ? '1' : '0'}&skin=dev-tool`;

      execFileSync(
        chromeBin,
        [
          '--headless',
          '--disable-gpu',
          '--no-pdf-header-footer',
          '--virtual-time-budget=6000',
          `--print-to-pdf=${outPath}`,
          url,
        ],
        { stdio: 'ignore' },
      );

      try {
        validateGeneratedPdf({ pdfPath: outPath, spec, isPublic, privateContact });
      } catch (err) {
        if (isPublic && existsSync(outPath)) {
          unlinkSync(outPath);
        }
        throw err;
      }

      generatedFiles.push(filename);
      console.log(
        `  ✓ ${filename} (${spec.expectedPages} A4 page${spec.expectedPages > 1 ? 's' : ''})`,
      );
    }

    // Remove only previously generator-managed PDFs that are no longer in the matrix,
    // preserving any user-customized PDFs stored in the local private directory.
    const expectedSet = new Set(generatedFiles);
    for (const prevFile of previouslyManagedFiles) {
      if (prevFile.endsWith('.pdf') && !expectedSet.has(prevFile)) {
        const prevPath = path.join(outDir, prevFile);
        if (existsSync(prevPath)) {
          unlinkSync(prevPath);
        }
      }
    }

    return generatedFiles;
  } finally {
    await stopProcessGroup(server);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const publicOnly = args.has('--public-only');
  const privateOnly = args.has('--private-only');

  if (publicOnly && privateOnly) {
    throw new Error('Cannot combine --public-only and --private-only');
  }

  const chromeBin = findCommand(['google-chrome', 'chromium', 'chromium-browser']);
  if (!chromeBin) {
    throw new Error(
      'Chrome/Chromium binary not found (tried google-chrome, chromium, chromium-browser).',
    );
  }
  if (!findCommand(['pdfinfo']) || !findCommand(['pdftotext'])) {
    throw new Error(
      'poppler-utils (pdfinfo and pdftotext) are required to verify A4 page counts and PII guards.',
    );
  }

  const envLocal = parseEnvFile(ENV_LOCAL_PATH);
  const privateContact = {
    email: (process.env.CV_EMAIL || envLocal.CV_EMAIL || '').trim(),
    phone: (process.env.CV_PHONE || envLocal.CV_PHONE || '').trim(),
  };

  const originalNextEnvDts = existsSync(NEXT_ENV_DTS_PATH)
    ? readFileSync(NEXT_ENV_DTS_PATH, 'utf8')
    : null;
  rmSync(ISOLATED_DIST_PATH, { recursive: true, force: true });

  const privateManifestPath = path.join(PRIVATE_CV_DIR, '.generated-manifest.json');

  try {
    if (!privateOnly) {
      const publicFiles = await generatePass({
        chromeBin,
        label: 'public',
        isPublic: true,
        outDir: PUBLIC_CV_DIR,
        manifestPath: MANIFEST_PATH,
        privateContact,
      });
      const checksums = Object.fromEntries(
        publicFiles.map((file) => [file, computeFileSha256(path.join(PUBLIC_CV_DIR, file))]),
      );
      const manifest = {
        inputHash: computeCvInputHash(REPO_ROOT),
        files: publicFiles,
        checksums,
      };
      writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
      console.log(`  ✓ Updated ${path.relative(REPO_ROOT, MANIFEST_PATH)}`);
    }

    if (!publicOnly) {
      if (!privateContact.email && !privateContact.phone) {
        console.log(
          '\n[private] Skipped: neither CV_EMAIL nor CV_PHONE is set in apps/web/.env.local.',
        );
        if (privateOnly) {
          process.exitCode = 1;
        }
        return;
      }
      const privateFiles = await generatePass({
        chromeBin,
        label: 'private',
        isPublic: false,
        outDir: PRIVATE_CV_DIR,
        manifestPath: privateManifestPath,
        privateContact,
      });
      writeFileSync(
        privateManifestPath,
        `${JSON.stringify({ files: privateFiles }, null, 2)}\n`,
        'utf8',
      );
      console.log(
        `  ✓ Private PDFs written to ${path.relative(REPO_ROOT, PRIVATE_CV_DIR)}/ (gitignored)`,
      );
    }
  } finally {
    rmSync(ISOLATED_DIST_PATH, { recursive: true, force: true });
    if (originalNextEnvDts !== null) {
      writeFileSync(NEXT_ENV_DTS_PATH, originalNextEnvDts, 'utf8');
    }
  }
}

main().catch((err) => {
  console.error(`\n[cv:pdf] Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
