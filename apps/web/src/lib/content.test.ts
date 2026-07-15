import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileProject, getProjectSlugs } from './content';

describe('content', () => {
  it('lista los mismos slugs en ambos locales', async () => {
    const es = await getProjectSlugs('es');
    const en = await getProjectSlugs('en');
    expect(es).toEqual(en);
    expect(es).toContain('freepik-api-platform');
  });

  it('slug inexistente devuelve null', async () => {
    expect(await compileProject('en', 'no-existe')).toBeNull();
  });

  it('compila frontmatter tipado y contenido', async () => {
    const result = await compileProject('en', 'flows-api');
    expect(result?.frontmatter.title.length).toBeGreaterThan(0);
    expect(result?.frontmatter.stack.length).toBeGreaterThan(0);
  });

  it('frontmatter inválido LANZA (build rojo, nunca contenido vacío)', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'content-'));
    try {
      await mkdir(path.join(root, 'en/projects'), { recursive: true });
      await writeFile(path.join(root, 'en/projects/bad.mdx'), '---\ntitle: Solo título\n---\nX');
      await expect(compileProject('en', 'bad', root)).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
