import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PrintButton } from './print-button';

describe('PrintButton', () => {
  it('llama a window.print() al hacer click', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<PrintButton label="Imprimir CV" />);
    const button = screen.getByRole('button', { name: 'Imprimir CV' });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });
});
