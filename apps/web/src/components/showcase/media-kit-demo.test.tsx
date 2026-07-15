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
  zoomCta: 'Enlarge with zoom',
  lightboxLabel: 'Result in fullscreen',
  resultAlt: 'Processed result in fullscreen',
};

describe('MediaKitDemo', () => {
  it('uses the passed strings for the lightbox open CTA, not the hardcoded Spanish copy', () => {
    render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    expect(screen.getByRole('button', { name: enStrings.zoomCta })).toBeInTheDocument();
    expect(screen.queryByText('Ampliar con zoom')).not.toBeInTheDocument();
  });

  it('opens the lightbox showing the passed EN labels, without falling back to Spanish', async () => {
    const user = userEvent.setup();
    render(<MediaKitDemo labels={enLabels} strings={enStrings} />);
    await user.click(screen.getByRole('button', { name: enStrings.zoomCta }));
    expect(await screen.findByRole('button', { name: enLabels.close })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();
  });
});
