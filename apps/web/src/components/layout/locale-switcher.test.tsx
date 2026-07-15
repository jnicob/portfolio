import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import es from '../../../messages/es.json';
import { LocaleSwitcher } from './locale-switcher';

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/projects',
  useRouter: () => ({ replace }),
}));

function renderAt(locale: 'es' | 'en') {
  render(
    <NextIntlClientProvider locale={locale} messages={es}>
      <LocaleSwitcher />
    </NextIntlClientProvider>,
  );
}

describe('LocaleSwitcher', () => {
  it('anuncia el idioma destino y conserva la ruta', async () => {
    renderAt('es');
    const button = screen.getByRole('button', { name: 'Switch to English' });
    await userEvent.click(button);
    expect(replace).toHaveBeenCalledWith('/projects', { locale: 'en' });
  });
});
