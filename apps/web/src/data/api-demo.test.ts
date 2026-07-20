import { describe, expect, it } from 'vitest';
import { apiDemoExamples } from './api-demo';
import { galleryItems } from './gallery';

describe('apiDemoExamples', () => {
  it('expone los 4 ejemplos en orden imagen, vídeo, audio, error', () => {
    expect(apiDemoExamples.map((example) => example.id)).toEqual([
      'image',
      'video',
      'audio',
      'error',
    ]);
  });

  it('los previews de medios reutilizan assets existentes de la galería', () => {
    const sources = new Set(
      galleryItems.flatMap((item) =>
        Object.values(item).filter((value) => typeof value === 'string'),
      ),
    );
    for (const example of apiDemoExamples) {
      if (example.preview.kind === 'error') continue;
      expect(sources.has(example.preview.src)).toBe(true);
    }
  });

  it('el ejemplo de error no tiene medio y su status es 4xx', () => {
    const error = apiDemoExamples.find((example) => example.id === 'error');
    expect(error?.preview).toEqual({ kind: 'error' });
    expect(error?.status).toMatch(/^4\d\d /);
  });
});
