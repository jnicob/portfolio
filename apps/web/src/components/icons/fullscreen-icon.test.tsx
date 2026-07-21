import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FullscreenIcon } from './fullscreen-icon';

describe('FullscreenIcon', () => {
  it('es decorativo y hereda el color del control que lo contiene', () => {
    const { container } = render(<FullscreenIcon />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('stroke', 'currentColor');
  });
});
