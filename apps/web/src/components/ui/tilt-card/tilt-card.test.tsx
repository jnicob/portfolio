import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TiltCard } from './tilt-card';

/**
 * Stubea matchMedia por query (no un booleano global): TiltCard consulta dos
 * media queries independientes — puntero fino y reduced-motion — y cada test
 * necesita combinarlas de forma distinta.
 */
function stubMatchMedia(queries: Record<string, boolean>) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: queries[query] ?? false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getRoot() {
  return screen.getByText('content').closest('[data-tilt]') as HTMLElement;
}

describe('TiltCard', () => {
  it('con puntero fino, mover el ratón inclina y posiciona el glow', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    } as DOMRect);

    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('4.00deg');
    expect(root.style.getPropertyValue('--tilt-gx')).toBe('100.0%');

    fireEvent.pointerLeave(root);
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('0deg');
  });

  it('con reduced-motion no inclina', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: true });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('');
  });

  it('con reduced-motion, el glow sigue apareciendo al hover pero queda centrado (no sigue el puntero)', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: true });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    expect(root.style.getPropertyValue('--tilt-gx')).toBe('');
    expect(root.querySelector('[aria-hidden]')).toHaveClass('opacity-[0.12]');
  });

  it('en touch (sin puntero fino) es un div inerte: sin glow y sin inclinación', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: false, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('');
    expect(root.querySelector('[aria-hidden]')).not.toBeInTheDocument();
  });

  it('con rect de ancho/alto 0 (layout aún no medido) no escribe custom properties', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    } as DOMRect);

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('');
  });

  it('reenvía className al elemento raíz (para posicionar el glow con `relative`)', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard className="relative">
        <div>content</div>
      </TiltCard>,
    );
    expect(getRoot()).toHaveClass('relative');
  });

  it('maxTilt escala la magnitud de la inclinación', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard maxTilt={8}>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    } as DOMRect);

    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('8.00deg');
  });
});
