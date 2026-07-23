import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mdxComponents } from './mdx-components';

const MdxLink = mdxComponents.a;

describe('ExternalAwareLink', () => {
  it.each(['https://example.com', 'http://example.com', '//example.com'])(
    'marca %s como externo con rel seguro',
    (href) => {
      render(<MdxLink href={href}>x</MdxLink>);
      const link = screen.getByRole('link', { name: 'x' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    },
  );

  it.each(['/es/projects', '#seccion', 'mailto:a@b.c'])('deja %s como enlace normal', (href) => {
    render(<MdxLink href={href}>x</MdxLink>);
    const link = screen.getByRole('link', { name: 'x' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});
