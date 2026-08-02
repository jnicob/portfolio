import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renderiza un textarea con sus props básicas', () => {
    render(<Textarea placeholder="Escribe tu mensaje..." defaultValue="Texto de prueba" />);
    const el = screen.getByPlaceholderText('Escribe tu mensaje...') as HTMLTextAreaElement;
    expect(el).toBeInTheDocument();
    expect(el.value).toBe('Texto de prueba');
  });

  it('aplica estado aria-invalid cuando es inválido', () => {
    render(<Textarea aria-invalid="true" data-testid="test-textarea" />);
    const el = screen.getByTestId('test-textarea');
    expect(el).toHaveAttribute('aria-invalid', 'true');
  });

  it('deshabilita el control correctamente', () => {
    render(<Textarea disabled data-testid="test-textarea" />);
    const el = screen.getByTestId('test-textarea');
    expect(el).toBeDisabled();
  });
});
