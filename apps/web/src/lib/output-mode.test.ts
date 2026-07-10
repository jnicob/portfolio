import { describe, expect, it } from 'vitest';
import { resolveOutputMode } from './output-mode';

describe('resolveOutputMode', () => {
  it('devuelve export por defecto (sin variable)', () => {
    expect(resolveOutputMode({})).toBe('export');
  });

  it('devuelve node cuando NEXT_OUTPUT_MODE=node', () => {
    expect(resolveOutputMode({ NEXT_OUTPUT_MODE: 'node' })).toBe('node');
  });

  it('devuelve export ante valores desconocidos', () => {
    expect(resolveOutputMode({ NEXT_OUTPUT_MODE: 'wat' })).toBe('export');
  });
});
