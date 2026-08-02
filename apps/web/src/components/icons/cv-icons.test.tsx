import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrinterIcon } from './printer-icon';
import { ShareIcon } from './share-icon';

describe('Icons', () => {
  it('PrinterIcon renderiza un SVG aria-hidden', () => {
    const { container } = render(<PrinterIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('ShareIcon renderiza un SVG aria-hidden', () => {
    const { container } = render(<ShareIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
