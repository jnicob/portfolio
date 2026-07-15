import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ReactElement } from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import { projectFrontmatterSchema, type ProjectFrontmatter } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';

const DEFAULT_ROOT = path.join(process.cwd(), 'content');

export async function getProjectSlugs(locale: Locale, root = DEFAULT_ROOT): Promise<string[]> {
  const files = await readdir(path.join(root, locale, 'projects'));
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
    .sort();
}

export async function compileProject(
  locale: Locale,
  slug: string,
  root = DEFAULT_ROOT,
): Promise<{ frontmatter: ProjectFrontmatter; content: ReactElement } | null> {
  let source: string;
  try {
    source = await readFile(path.join(root, locale, 'projects', `${slug}.mdx`), 'utf8');
  } catch {
    return null; // slug inexistente → la página decide (notFound)
  }
  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
  });
  // Frontmatter inválido lanza: datos rotos = build rojo, jamás página vacía.
  return { frontmatter: projectFrontmatterSchema.parse(frontmatter), content };
}
