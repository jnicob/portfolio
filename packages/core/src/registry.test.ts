import { describe, expect, it } from 'vitest';
import { generationRequestSchema, PROVIDERS, SERVICES } from './registry';
import { ASPECT_RATIOS } from './types';

const valid = {
  service: 'generate-image',
  provider: 'mock',
  prompt: 'a red fox',
  model: 'flux',
  aspectRatio: 'square_1_1',
  seed: 42,
};

describe('registry', () => {
  it('validates a correct request', () => {
    expect(generationRequestSchema.parse(valid)).toEqual(valid);
  });
  it.each([
    ['empty prompt', { ...valid, prompt: '  ' }],
    ['negative seed', { ...valid, seed: -1 }],
    ['non-integer seed', { ...valid, seed: 1.5 }],
    ['unknown aspect ratio', { ...valid, aspectRatio: 'panoramic' }],
    ['unknown provider', { ...valid, provider: 'openai' }],
  ])('rejects %s', (_name, input) => {
    expect(generationRequestSchema.safeParse(input).success).toBe(false);
  });
  it('every model declared by a provider belongs to a service in the registry', () => {
    const serviceIds = SERVICES.map((s) => s.id);
    for (const p of PROVIDERS)
      for (const mode of Object.keys(p.models)) expect(serviceIds).toContain(mode);
  });
  it('every aspect ratio has positive dimensions', () => {
    for (const dims of Object.values(ASPECT_RATIOS)) {
      expect(dims.width).toBeGreaterThan(0);
      expect(dims.height).toBeGreaterThan(0);
    }
  });
});
