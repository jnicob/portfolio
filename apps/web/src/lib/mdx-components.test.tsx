import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import { mdxComponents } from './mdx-components';

const MdxLink = mdxComponents.a;

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={{}}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('ExternalAwareLink', () => {
  it.each(['https://example.com', 'http://example.com', '//example.com'])(
    'marca %s como externo con rel seguro',
    (href) => {
      renderWithIntl(<MdxLink href={href}>x</MdxLink>);
      const link = screen.getByRole('link', { name: 'x' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    },
  );

  it.each(['/es/projects', '#seccion', 'mailto:a@b.c'])('deja %s como enlace normal', (href) => {
    renderWithIntl(<MdxLink href={href}>x</MdxLink>);
    const link = screen.getByRole('link', { name: 'x' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('normaliza enlaces relativos ./slug a /projects/slug manteniendo prefijo de locale', () => {
    renderWithIntl(<MdxLink href="./freepik-api-platform">x</MdxLink>);
    const link = screen.getByRole('link', { name: 'x' });
    expect(link).toHaveAttribute('href', '/en/projects/freepik-api-platform');
  });
});
