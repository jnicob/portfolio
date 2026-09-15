import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShareViewButton } from './share-view-button';

const LABELS = { share: 'Share this view', copied: 'Link copied', error: 'Could not copy' };

/**
 * `userEvent.setup()` installs its OWN `navigator.clipboard` stub (to support
 * user.copy()/paste()), overwriting any previous stub. That is why the mock is defined
 * AFTER `setup()`, using `Object.defineProperty` on the actual `navigator` — replacing
 * the entire `navigator` object (`vi.stubGlobal`) breaks userEvent's internal detection
 * (it reads other props like `userAgent`) and clicks stop being dispatched.
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

  it('feedback returns to idle 2s after copying', async () => {
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
