import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LightboxControls, type MediaLightboxLabels } from './lightbox-controls';

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
};

function renderControls(overrides: Record<string, unknown> = {}) {
  const handlers = {
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onReset: vi.fn(),
    onCycleFit: vi.fn(),
    onToggleFullscreen: vi.fn(),
    onClose: vi.fn(),
  };
  render(
    <LightboxControls
      labels={LABELS}
      percent={100}
      announcedPercent={100}
      atMin
      atMax={false}
      fit="contain"
      nextFit="cover"
      fullscreenSupported
      fullscreenActive={false}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe('LightboxControls', () => {
  it('grupo etiquetado con todos los comandos', () => {
    renderControls();
    expect(screen.getByRole('group', { name: 'Controls' })).toBeInTheDocument();
    for (const name of ['Zoom out', 'Zoom in', 'Reset view', 'Enter fullscreen', 'Close']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(
      screen.getByRole('button', { name: 'Fit: contain. Switch to cover' }),
    ).toBeInTheDocument();
  });

  it('deshabilita zoom out en el mínimo y muestra el porcentaje', () => {
    renderControls({ percent: 150, announcedPercent: 150, atMin: false, atMax: true });
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeEnabled();
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('anuncia el zoom con aria-live usando la plantilla', () => {
    renderControls({ announcedPercent: 200 });
    expect(screen.getByText('Zoom 200%')).toBeInTheDocument();
  });

  it('sin soporte fullscreen no renderiza el botón', () => {
    renderControls({ fullscreenSupported: false });
    expect(screen.queryByRole('button', { name: 'Enter fullscreen' })).not.toBeInTheDocument();
  });

  it('fullscreen activo usa la etiqueta de salir', () => {
    renderControls({ fullscreenActive: true });
    expect(screen.getByRole('button', { name: 'Exit fullscreen' })).toBeInTheDocument();
  });

  it('dispara los callbacks', async () => {
    const handlers = renderControls({ atMin: false });
    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fit: contain. Switch to cover' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(handlers.onZoomIn).toHaveBeenCalledOnce();
    expect(handlers.onZoomOut).toHaveBeenCalledOnce();
    expect(handlers.onCycleFit).toHaveBeenCalledOnce();
    expect(handlers.onClose).toHaveBeenCalledOnce();
  });
});
