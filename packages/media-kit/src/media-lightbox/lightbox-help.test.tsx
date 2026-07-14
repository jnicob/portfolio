import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LightboxHelp } from './lightbox-help';
import type { MediaLightboxLabels } from './media-lightbox';

const LABELS: MediaLightboxLabels = {
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
  help: 'Atajos de teclado',
  helpTitle: 'Atajos de teclado',
  shortcutZoom: 'Acercar / alejar',
  shortcutReset: 'Restablecer vista',
  shortcutPanKeys: 'Desplazar',
  shortcutPanDrag: 'Mantén Espacio y arrastra para desplazar',
  shortcutFit: 'Cambiar modo de ajuste (toolbar)',
  shortcutFullscreen: 'Pantalla completa',
  shortcutControls: 'Mostrar / ocultar controles',
  shortcutHelp: 'Mostrar esta ayuda',
  shortcutClose: 'Cerrar',
};

describe('LightboxHelp', () => {
  it('es una región group etiquetada con helpTitle, enfocable programáticamente', () => {
    render(<LightboxHelp labels={LABELS} />);
    const panel = screen.getByRole('group', { name: 'Atajos de teclado' });
    expect(panel).toHaveAttribute('data-mk-help');
    expect(panel).toHaveAttribute('tabindex', '-1');
  });

  it('renderiza una fila por atajo con la descripción de labels', () => {
    render(<LightboxHelp labels={LABELS} />);
    for (const description of [
      'Acercar / alejar',
      'Restablecer vista',
      'Desplazar',
      'Mantén Espacio y arrastra para desplazar',
      'Cambiar modo de ajuste (toolbar)',
      'Pantalla completa',
      'Mostrar / ocultar controles',
      'Mostrar esta ayuda',
      'Cerrar',
    ]) {
      expect(screen.getByText(description)).toBeInTheDocument();
    }
  });

  it('las teclas son literales en <kbd>', () => {
    render(<LightboxHelp labels={LABELS} />);
    for (const key of ['Space', 'Esc', '?', 'f', 'c', '0']) {
      expect(screen.getByText(key, { selector: 'kbd' })).toBeInTheDocument();
    }
  });
});
