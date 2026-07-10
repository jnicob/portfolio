import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renderiza el contenido con la variante', () => {
    render(<Badge variant="accent">NEW</Badge>);
    const el = screen.getByText('NEW');
    expect(el.className).toContain('bg-accent/15');
  });
});
