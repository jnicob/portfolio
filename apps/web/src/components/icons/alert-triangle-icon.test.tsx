import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlertTriangleIcon } from './alert-triangle-icon';

describe('AlertTriangleIcon', () => {
  it('es decorativo y hereda el color semántico del estado', () => {
    const { container } = render(<AlertTriangleIcon />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('stroke', 'currentColor');
  });
});
