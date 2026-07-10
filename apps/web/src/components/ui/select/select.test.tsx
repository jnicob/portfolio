import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

const options = [
  { value: '1_1', label: '1:1' },
  { value: '16_9', label: '16:9' },
];

describe('Select', () => {
  it('selecciona una opción con teclado', async () => {
    render(<Select aria-label="Aspect ratio" options={options} defaultValue="1_1" />);
    const select = screen.getByRole('combobox', { name: 'Aspect ratio' });
    await userEvent.selectOptions(select, '16_9');
    expect(select).toHaveValue('16_9');
  });
});
