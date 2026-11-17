import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PrintButton } from './print-button';

describe('PrintButton', () => {
  it('calls window.print() when clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<PrintButton label="Imprimir CV" />);
    const button = screen.getByRole('button', { name: 'Imprimir CV' });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });

  it('clears active text selection and unwraps/resets search highlights before printing on click and beforeprint', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const removeAllRanges = vi.fn();
    const getSelectionSpy = vi
      .spyOn(window, 'getSelection')
      .mockReturnValue({ removeAllRanges } as unknown as Selection);
    const user = userEvent.setup();

    render(
      <div>
        <PrintButton label="Imprimir CV" />
        <p data-testid="cv-text">
          Experienced with <mark data-testid="search-mark">JavaScript</mark> and React
        </p>
      </div>,
    );

    const button = screen.getByRole('button', { name: 'Imprimir CV' });
    await user.click(button);

    expect(removeAllRanges).toHaveBeenCalled();
    expect(screen.queryByTestId('search-mark')).not.toBeInTheDocument();
    expect(screen.getByTestId('cv-text')).toHaveTextContent(
      'Experienced with JavaScript and React',
    );

    removeAllRanges.mockClear();
    fireEvent(window, new Event('beforeprint'));
    expect(removeAllRanges).toHaveBeenCalledTimes(1);

    getSelectionSpy.mockRestore();
    printSpy.mockRestore();
  });
});
