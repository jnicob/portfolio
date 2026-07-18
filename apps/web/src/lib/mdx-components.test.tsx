import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mdxComponents } from './mdx-components';

describe('mdxComponents', () => {
  it('los enlaces externos del MDX abren en pestaña nueva', () => {
    const A = mdxComponents.a!;
    render(<A href="https://example.com">Ext</A>);
    const link = screen.getByRole('link', { name: 'Ext' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('los enlaces internos no', () => {
    const A = mdxComponents.a!;
    render(<A href="/es/projects">Int</A>);
    expect(screen.getByRole('link', { name: 'Int' })).not.toHaveAttribute('target');
  });
});
