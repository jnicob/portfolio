import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnimatedMetric, formatLike } from './animated-metric';

describe('formatLike', () => {
  it('conserva separador de miles y sufijo del literal original', () => {
    expect(formatLike('1.000+', 500)).toBe('500+');
    expect(formatLike('1.000+', 1000)).toBe('1.000+');
    expect(formatLike('40+', 12)).toBe('12+');
  });

  it('devuelve el literal sin cambios cuando no contiene dígitos', () => {
    expect(formatLike('N/A', 5)).toBe('N/A');
  });
});

describe('AnimatedMetric', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sin IntersectionObserver muestra el valor final directo', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<AnimatedMetric value="25+" />);
    expect(screen.getByText('25+', { selector: '[aria-hidden]' })).toBeInTheDocument();
  });

  it('expone el valor real para lectores de pantalla', () => {
    render(<AnimatedMetric value="1.000+" />);
    expect(screen.getByText('1.000+', { selector: '.sr-only' })).toBeInTheDocument();
  });
});
