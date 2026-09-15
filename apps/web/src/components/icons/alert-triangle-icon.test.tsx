import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlertTriangleIcon } from './alert-triangle-icon';

describe('AlertTriangleIcon', () => {
  it('is decorative and inherits the semantic state color', () => {
    const { container } = render(<AlertTriangleIcon />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('stroke', 'currentColor');
  });
});
