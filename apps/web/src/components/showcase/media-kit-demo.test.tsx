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
  beforeAfterAlt: 'Original low-resolution image',
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

  it('renders one expand button per CompareSlider demo, using the passed strings', () => {
    render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    expect(screen.getAllByRole('button', { name: enStrings.fullScreen })).toHaveLength(3);
  });

  it('opens the compare-lightbox showing the passed EN labels, without falling back to Spanish', async () => {
    const user = userEvent.setup();
    render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    const [firstExpandButton] = screen.getAllByRole('button', { name: enStrings.fullScreen });
    await user.click(firstExpandButton as HTMLElement);
    expect(await screen.findByRole('button', { name: enLabels.close })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();
  });
});
