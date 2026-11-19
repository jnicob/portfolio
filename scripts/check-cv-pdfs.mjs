import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CV_INPUT_FILES,
  CV_PUBLIC_PDF_SPECS,
  computeCvInputHash,
  computeFileSha256,
  publicPdfFilename,
} from './cv-pdf-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const PUBLIC_CV_REL_DIR = 'apps/web/public/cv';
const PUBLIC_CV_DIR = path.join(REPO_ROOT, PUBLIC_CV_REL_DIR);
const MANIFEST_REL_PATH = `${PUBLIC_CV_REL_DIR}/manifest.json`;
const MANIFEST_PATH = path.join(REPO_ROOT, MANIFEST_REL_PATH);

function fail(message) {
  console.error(`[cv:pdf:check] ${message}`);
  console.error('[cv:pdf:check] Run `pnpm run cv:pdf` and commit the updated PDFs before pushing.');
  process.exit(1);
}

function parseGitRefArg(argv) {
  const idx = argv.indexOf('--git-ref');
  if (idx === -1) return null;
  const ref = argv[idx + 1];
  if (!ref || ref.startsWith('--')) {
    fail('Missing commit SHA after `--git-ref`.');
  }
  return ref;
}

function readGitBlob(gitRef, relPath) {
  try {
    return execFileSync('git', ['show', `${gitRef}:${relPath}`], {
      cwd: REPO_ROOT,
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return null;
  }
}

function listGitDir(gitRef, relDir) {
  try {
    const out = execFileSync('git', ['ls-tree', '--name-only', gitRef, `${relDir}/`], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    return out
      .split(/\r?\n/)
      .filter(Boolean)
      .map((entry) => path.posix.basename(entry));
  } catch {
    return [];
  }
}

function computeCvInputHashForGitRef(gitRef) {
  const hash = createHash('sha256');
  const binaryExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
  for (const relPath of CV_INPUT_FILES) {
    const buf = readGitBlob(gitRef, relPath);
    if (!buf) {
      fail(`Missing CV input file in commit ${gitRef.slice(0, 12)}: ${relPath}`);
    }
    hash.update(`${relPath}\0`);
    if (binaryExts.has(path.extname(relPath).toLowerCase())) {
      hash.update(buf);
    } else {
      hash.update(buf.toString('utf8').replace(/\r\n/g, '\n'));
    }
    hash.update('\0');
  }
  return hash.digest('hex');
}

const gitRef = parseGitRefArg(process.argv.slice(2));

const rawManifest = gitRef
  ? (readGitBlob(gitRef, MANIFEST_REL_PATH)?.toString('utf8') ?? null)
  : existsSync(MANIFEST_PATH)
    ? readFileSync(MANIFEST_PATH, 'utf8')
    : null;

if (!rawManifest) {
  fail(`Missing ${MANIFEST_REL_PATH}${gitRef ? ` in commit ${gitRef.slice(0, 12)}` : ''}.`);
}

let manifest;
try {
  manifest = JSON.parse(rawManifest);
} catch {
  fail(`${MANIFEST_REL_PATH} is not valid JSON.`);
}

const expectedHash = gitRef ? computeCvInputHashForGitRef(gitRef) : computeCvInputHash(REPO_ROOT);
if (manifest.inputHash !== expectedHash) {
  fail(
    `CV source inputs changed since PDFs were generated (manifest=${manifest.inputHash?.slice(0, 12) ?? 'missing'}, current=${expectedHash.slice(0, 12)}).`,
  );
}

const expectedFiles = CV_PUBLIC_PDF_SPECS.map((spec) =>
  publicPdfFilename(spec.locale, spec.view, spec.photo),
);

if (
  !Array.isArray(manifest.files) ||
  manifest.files.length !== expectedFiles.length ||
  manifest.files.some((file, idx) => file !== expectedFiles[idx])
) {
  fail(`${MANIFEST_REL_PATH} file list does not match expected CV PDF specs.`);
}

if (!manifest.checksums || typeof manifest.checksums !== 'object') {
  fail(`${MANIFEST_REL_PATH} is missing per-file PDF checksums.`);
}

const allowedEntries = new Set(['manifest.json', ...expectedFiles]);
const actualEntries = gitRef ? listGitDir(gitRef, PUBLIC_CV_REL_DIR) : readdirSync(PUBLIC_CV_DIR);
const unexpectedEntries = actualEntries.filter((name) => !allowedEntries.has(name));
if (unexpectedEntries.length > 0) {
  fail(
    `Unexpected file(s) in ${PUBLIC_CV_REL_DIR}/ (remove unapproved/private PDFs): ${unexpectedEntries.join(', ')}`,
  );
}

for (const filename of expectedFiles) {
  const relFilePath = `${PUBLIC_CV_REL_DIR}/${filename}`;
  const fileBuffer = gitRef
    ? readGitBlob(gitRef, relFilePath)
    : existsSync(path.join(PUBLIC_CV_DIR, filename))
      ? readFileSync(path.join(PUBLIC_CV_DIR, filename))
      : null;

  if (!fileBuffer) {
    fail(`Missing public PDF: ${relFilePath}`);
  }
  if (fileBuffer.subarray(0, 5).toString('utf8') !== '%PDF-') {
    fail(`Corrupt or non-PDF file: ${relFilePath}`);
  }
  const expectedChecksum = manifest.checksums[filename];
  const actualChecksum = gitRef
    ? createHash('sha256').update(fileBuffer).digest('hex')
    : computeFileSha256(path.join(PUBLIC_CV_DIR, filename));
  if (!expectedChecksum || actualChecksum !== expectedChecksum) {
    fail(`Checksum mismatch for ${relFilePath}.`);
  }
}

console.log(
  `[cv:pdf:check] OK — ${expectedFiles.length} public CV PDFs${gitRef ? ` at ${gitRef.slice(0, 12)}` : ''} match source hash ${expectedHash.slice(0, 12)}.`,
);
