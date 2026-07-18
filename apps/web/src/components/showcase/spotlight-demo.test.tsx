import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpotlightDemo, type SpotlightDemoStrings } from './spotlight-demo';

const strings: SpotlightDemoStrings = {
  label: 'Reveal color under the spotlight',
  baseAlt: 'Black and white version of the neon portrait',
  baseBadge: 'B&W',
  revealBadge: 'Color',
  caption: 'SpotlightReveal caption',
};

describe('SpotlightDemo', () => {
  it('renders SpotlightReveal with the accessible spotlight role and the neon portrait (gallery T8 asset, design review F3.6 T21: not the same landscape photo as the demos above)', () => {
    render(<SpotlightDemo strings={strings} />);
    const root = screen.getByLabelText(strings.label);
    expect(root).toHaveAttribute('aria-roledescription', 'spotlight');
    const base = screen.getByAltText(strings.baseAlt);
    expect(base).toHaveAttribute('src', '/demo/gallery/nbp-retrato-neon.webp');
    expect(base.style.filter).toBe('grayscale(1)');
    // Dimensiones reales del asset (apps/web/src/data/gallery.ts): 1200×1608, retrato.
    expect(base).toHaveAttribute('width', '1200');
    expect(base).toHaveAttribute('height', '1608');
  });

  it('uses the same neon portrait photo for both base and reveal layers (one asset, one filter)', () => {
    const { container } = render(<SpotlightDemo strings={strings} />);
    const portraitImages = container.querySelectorAll(
      'img[src="/demo/gallery/nbp-retrato-neon.webp"]',
    );
    expect(portraitImages).toHaveLength(2);
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

  // Perf (T30/qa-B1): mismo patrón que MediaKitDemo — el asset base (1200w) sirve de
  // variante ligera; el `-hd` (2560w, T14) sirve pantallas grandes/retina vía srcSet.
  it('ambas capas ofrecen la variante HD vía srcSet para pantallas grandes/retina', () => {
    const { container } = render(<SpotlightDemo strings={strings} />);
    const portraitImages = Array.from(
      container.querySelectorAll<HTMLImageElement>(
        'img[src="/demo/gallery/nbp-retrato-neon.webp"]',
      ),
    );
    expect(portraitImages).toHaveLength(2);
    for (const img of portraitImages) {
      expect(img).toHaveAttribute(
        'srcset',
        '/demo/gallery/nbp-retrato-neon.webp 1200w, /demo/gallery/nbp-retrato-neon-hd.webp 2560w',
      );
      expect(img.getAttribute('sizes')).toBeTruthy();
    }
  });
});
