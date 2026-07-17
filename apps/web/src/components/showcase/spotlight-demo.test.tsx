import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpotlightDemo, type SpotlightDemoStrings } from './spotlight-demo';

const strings: SpotlightDemoStrings = {
  label: 'Reveal color under the spotlight',
  baseAlt: 'Black and white version of the landscape photo',
  baseBadge: 'B&W',
  revealBadge: 'Color',
  caption: 'SpotlightReveal caption',
};

describe('SpotlightDemo', () => {
  it('renders SpotlightReveal with the accessible spotlight role and the landscape photo', () => {
    render(<SpotlightDemo strings={strings} />);
    const root = screen.getByLabelText(strings.label);
    expect(root).toHaveAttribute('aria-roledescription', 'spotlight');
    const base = screen.getByAltText(strings.baseAlt);
    expect(base).toHaveAttribute('src', '/demo/landscape.webp');
    expect(base.style.filter).toBe('grayscale(1)');
    expect(base).toHaveAttribute('width', '1600');
    expect(base).toHaveAttribute('height', '900');
  });

  it('uses the same landscape photo for both base and reveal layers (one asset, one filter)', () => {
    const { container } = render(<SpotlightDemo strings={strings} />);
    const landscapeImages = container.querySelectorAll('img[src="/demo/landscape.webp"]');
    expect(landscapeImages).toHaveLength(2);
  });

  it('overlays base/reveal badges using the passed labels', () => {
    render(<SpotlightDemo strings={strings} />);
    expect(screen.getByText(strings.baseBadge)).toBeInTheDocument();
    expect(screen.getByText(strings.revealBadge)).toBeInTheDocument();
  });

  it('renders the caption from props', () => {
    render(<SpotlightDemo strings={strings} />);
    expect(screen.getByText(strings.caption)).toBeInTheDocument();
  });

  // Perf (T30/qa-B1): mismo fix que MediaKitDemo — landscape.webp es 1600×900, muy por
  // encima del ancho real de esta figure en mobile. srcSet deja elegir la variante ~840w.
  it('ambas capas ofrecen una variante ~840w vía srcSet', () => {
    const { container } = render(<SpotlightDemo strings={strings} />);
    const landscapeImages = Array.from(
      container.querySelectorAll<HTMLImageElement>('img[src="/demo/landscape.webp"]'),
    );
    expect(landscapeImages).toHaveLength(2);
    for (const img of landscapeImages) {
      expect(img).toHaveAttribute(
        'srcset',
        '/demo/landscape-840.webp 840w, /demo/landscape.webp 1600w',
      );
      expect(img.getAttribute('sizes')).toBeTruthy();
    }
  });
});
