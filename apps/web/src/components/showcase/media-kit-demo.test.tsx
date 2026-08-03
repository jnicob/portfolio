import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { MediaLightboxLabels } from '@nicobehm/media-kit';
import { MediaKitDemo, type MediaKitDemoStrings } from './media-kit-demo';

const enLabels: MediaLightboxLabels = {
  controls: 'Controls',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomLevel: 'Zoom {percent}%',
  reset: 'Reset view',
  fit: 'Fit: {current}. Switch to {next}',
  fullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
  hideControls: 'Hide controls',
  showControls: 'Show controls',
  close: 'Close',
  help: 'Keyboard shortcuts',
  helpTitle: 'Keyboard shortcuts',
  shortcutZoom: 'Zoom in / out',
  shortcutReset: 'Reset view',
  shortcutPanKeys: 'Pan',
  shortcutPanDrag: 'Hold Space and drag to pan',
  shortcutFit: 'Cycle fit mode (toolbar)',
  shortcutFullscreen: 'Toggle fullscreen',
  shortcutControls: 'Show / hide controls',
  shortcutHelp: 'Toggle this help',
  shortcutClose: 'Close',
};

const enStrings: MediaKitDemoStrings = {
  beforeAfterAlt: 'Desaturated version of the photo',
  dragCompareLabel: 'Compare before and after (drag)',
  dragCaption: 'mode="drag" — drag the divider',
  hoverCompareLabel: 'Compare before and after (hover)',
  hoverCaption: 'mode="hover" — follows the pointer without clicking',
  fullScreen: 'Full Screen',
  compareLightboxLabel: 'Compare before and after',
  portraitBeforeAlt: 'Black and white portrait',
  portraitCompareLabel: 'Compare black and white with color',
  portraitCaption:
    'Simulated colorization — a single bitmap; the B&W side is derived with filter: grayscale(1). AI-generated portrait.',
};

describe('MediaKitDemo', () => {
  it('no longer renders the standalone "Enlarge with zoom" button nor a loose lightbox', () => {
    render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    expect(screen.queryByRole('button', { name: 'Enlarge with zoom' })).not.toBeInTheDocument();
    expect(screen.queryByText('Ampliar con zoom')).not.toBeInTheDocument();
  });

  it('renders one expand button per CompareSlider demo (landscape y portrait)', () => {
    render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    expect(screen.getAllByRole('button', { name: enStrings.fullScreen })).toHaveLength(2);
  });

  it('permite cambiar de modo entre drag y hover usando el checkbox', async () => {
    const user = userEvent.setup();
    render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText(enStrings.dragCaption)).toBeInTheDocument();
  });

  it('opens the compare-lightbox showing the passed EN labels, without falling back to Spanish', async () => {
    const user = userEvent.setup();
    render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    const [firstExpandButton] = screen.getAllByRole('button', { name: enStrings.fullScreen });
    await user.click(firstExpandButton as HTMLElement);
    expect(await screen.findByRole('button', { name: enLabels.close })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();
  });

  it('renders the real landscape photo on both sides of the consolidated demo, desaturating the before side with a CSS filter', () => {
    const { container } = render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    const landscapeImages = Array.from(
      container.querySelectorAll<HTMLImageElement>('img[src="/demo/landscape.webp"]'),
    );
    // 1 demo (consolidada) x 2 sides (before, after)
    expect(landscapeImages).toHaveLength(2);
    for (const img of landscapeImages) {
      expect(img).toHaveAttribute('width', '1600');
      expect(img).toHaveAttribute('height', '900');
    }
    const desaturatedImages = landscapeImages.filter((img) =>
      img.style.filter.includes('saturate'),
    );
    expect(desaturatedImages).toHaveLength(1);
  });

  it('las imágenes de landscape ofrecen una variante ~840w vía srcSet, con sizes acorde al grid', () => {
    const { container } = render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
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
