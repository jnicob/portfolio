import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShareViewButton } from './share-view-button';

const LABELS = { share: 'Share this view', copied: 'Link copied', error: 'Could not copy' };

/**
 * `userEvent.setup()` instala su PROPIO stub de `navigator.clipboard` (para soportar
 * user.copy()/paste()), pisando cualquier stub previo. Por eso el mock se define
 * DESPUÉS de `setup()`, con `Object.defineProperty` sobre el `navigator` real — reemplazar
 * el objeto `navigator` entero (`vi.stubGlobal`) rompe la detección interna de userEvent
 * (lee otras props como `userAgent`) y el click deja de despacharse.
 */
function stubClipboardAfterSetup(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

beforeEach(() => {
  document.documentElement.dataset.theme = 'dark';
  document.documentElement.dataset.skin = 'terminal';
  window.history.replaceState(null, '', '/es/cv');
});

afterEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.skin;
  window.history.replaceState(null, '', '/');
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('ShareViewButton', () => {
  it('copia al portapapeles la URL con la apariencia actual y la view activa', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboardAfterSetup(writeText);

    render(<ShareViewButton view="compact" labels={LABELS} />);
    await user.click(screen.getByRole('button', { name: LABELS.share }));

    expect(writeText).toHaveBeenCalledWith(
      'http://localhost:3000/es/cv?theme=dark&skin=terminal&view=compact',
    );
    expect(await screen.findByText(LABELS.copied)).toBeInTheDocument();
  });

  it('sin la prop view, la URL no incluye view=', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboardAfterSetup(writeText);

    render(<ShareViewButton labels={LABELS} />);
    await user.click(screen.getByRole('button', { name: LABELS.share }));

    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/es/cv?theme=dark&skin=terminal');
  });

  it('si el portapapeles rechaza, anuncia error sin lanzar ni loguear', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    stubClipboardAfterSetup(writeText);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ShareViewButton labels={LABELS} />);
    await expect(
      user.click(screen.getByRole('button', { name: LABELS.share })),
    ).resolves.not.toThrow();

    expect(await screen.findByText(LABELS.error)).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('el feedback vuelve a idle 2s después de copiar', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboardAfterSetup(writeText);

    render(<ShareViewButton labels={LABELS} />);
    await user.click(screen.getByRole('button', { name: LABELS.share }));
    expect(await screen.findByText(LABELS.copied)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText(LABELS.copied)).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  }, 6000);
});
