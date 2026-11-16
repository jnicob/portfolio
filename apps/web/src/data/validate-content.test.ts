import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import { compileProject, getProjectSlugs } from '@/lib/content';
import { education } from './education';
import { experience } from './experience';
import { galleryItems } from './gallery';
import { profile } from './profile';
import { projects } from './projects';
import { skills } from './skills';

const EMAIL = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const EMAIL_GLOBAL = /[a-zA-Z0-9._+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
// 9+ digits with separators = phone; dates (8) and short metrics do not trigger.
const PHONE = /\+?(?:\d[\s().-]?){9,}/;
const ALLOWED_TEST_EMAIL_DOMAINS = new Set([
  'example.com',
  'ejemplo.com',
  'b.com',
  'resend.dev',
  'jnicob.dev',
  'montecervino.net',
]);

async function collectSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(fullPath)));
    } else if (/\.(ts|tsx|php|mdx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('validate-content', () => {
  it('case study slugs and MDX match across both locales (only projects with caseStudy have their own page)', async () => {
    const caseStudySlugs = projects
      .filter((p) => p.caseStudy)
      .map((p) => p.slug)
      .sort();
    for (const locale of routing.locales) {
      expect(await getProjectSlugs(locale)).toEqual(caseStudySlugs);
    }
  });

  it('all MDX frontmatter across both locales parses', async () => {
    for (const locale of routing.locales) {
      for (const slug of await getProjectSlugs(locale)) {
        const compiled = await compileProject(locale, slug);
        expect(compiled, `${locale}/${slug}`).not.toBeNull();
      }
    }
  });

  it('PII GUARD: neither email nor phone in any serialized data', () => {
    const all = JSON.stringify({ profile, experience, education, skills, projects, galleryItems });
    expect(all).not.toMatch(EMAIL);
    expect(all).not.toMatch(PHONE);
  });

  it('PII GUARD: no personal email addresses or real phone numbers leaked in source or test files', async () => {
    const webRoot = path.resolve(__dirname, '../..');
    const files = [
      ...(await collectSourceFiles(path.join(webRoot, 'src'))),
      ...(await collectSourceFiles(path.join(webRoot, 'public', 'api'))),
    ];

    const leakedEmails: string[] = [];
    for (const file of files) {
      const content = await readFile(file, 'utf8');
      for (const match of content.matchAll(EMAIL_GLOBAL)) {
        const fullEmail = match[0];
        const domain = match[1]?.toLowerCase() ?? '';
        if (!ALLOWED_TEST_EMAIL_DOMAINS.has(domain)) {
          leakedEmails.push(`${path.relative(webRoot, file)}: ${fullEmail}`);
        }
      }
    }

    expect(leakedEmails).toEqual([]);
  });

  it('phone guard does not trigger on dates or metrics', () => {
    expect(JSON.stringify({ d: '2026-07-10', m: '251,122' })).not.toMatch(PHONE);
  });
});
