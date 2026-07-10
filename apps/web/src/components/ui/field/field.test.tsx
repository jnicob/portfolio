import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field } from './field';
import { Input } from '../input';

describe('Field', () => {
  it('asocia label y control', () => {
    render(
      <Field label="Prompt" htmlFor="prompt">
        <Input id="prompt" />
      </Field>,
    );
    expect(screen.getByLabelText('Prompt')).toBeInTheDocument();
  });

  it('expone el error como alert enlazado', () => {
    render(
      <Field label="Prompt" htmlFor="p" error="Obligatorio">
        <Input id="p" aria-describedby="p-error" aria-invalid />
      </Field>,
    );
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Obligatorio');
    expect(error).toHaveAttribute('id', 'p-error');
    expect(screen.getByLabelText('Prompt')).toHaveAttribute('aria-invalid', 'true');
  });
});
