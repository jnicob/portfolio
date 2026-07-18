import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { galleryItems } from './gallery';
import type { GalleryItem } from './schemas';

describe('galleryItems', () => {
  it('hay 16 ítems: 8 imagen / 5 vídeo / 3 audio, ids únicos', () => {
    expect(galleryItems).toHaveLength(16);
    const count = (type: GalleryItem['type']) => galleryItems.filter((i) => i.type === type).length;
    expect(count('image')).toBe(8);
    expect(count('video')).toBe(5);
    expect(count('audio')).toBe(3);
    expect(new Set(galleryItems.map((i) => i.id)).size).toBe(16);
  });

  it('todos los ficheros referenciados existen en public/', () => {
    const files = galleryItems.flatMap((i) =>
      i.type === 'image'
        ? [i.src, i.hdSrc]
        : i.type === 'video'
          ? [i.src, i.poster]
          : [i.src, i.cover, i.coverHd],
    );
    for (const f of files) expect(existsSync(join(process.cwd(), 'public', f)), f).toBe(true);
  });
});
