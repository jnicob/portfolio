import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renderiza el contenido con la variante', () => {
    render(<Badge variant="accent">NEW</Badge>);
    const el = screen.getByText('NEW');
    expect(el.className).toContain('bg-accent/15');
  });

  it('usa el radio tokenizado (rounded-badge), no rounded-full hardcodeado', () => {
    render(<Badge variant="neutral">TAG</Badge>);
    const el = screen.getByText('TAG');
    expect(el.className).toContain('rounded-badge');
    expect(el.className).not.toContain('rounded-full');
  });
});
