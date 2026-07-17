import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShowcaseIndex } from './showcase-index';

const ITEMS = [
  { id: 'button', label: 'Button' },
  { id: 'badge', label: 'Badge' },
  { id: 'card', label: 'Card' },
  { id: 'form', label: 'Formulario' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'media-kit', label: 'Media kit' },
];

describe('ShowcaseIndex', () => {
  it('renderiza una opción por sección del TOC', () => {
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('option')).toHaveLength(ITEMS.length);
  });

  it('filtrar "med" deja solo media-kit', async () => {
    const user = userEvent.setup();
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
        onSelect={vi.fn()}
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Filtrar secciones' }), 'med');

    expect(screen.getByRole('option', { name: 'Media kit' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('seleccionar una sección invoca onSelect con su id, sin tocar location.hash', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    window.location.hash = '';
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole('option', { name: 'Card' }));

    expect(onSelect).toHaveBeenCalledWith('card');
    expect(window.location.hash).toBe('');
  });

  it('marca la opción de selectedId como aplicada (aria-current)', () => {
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
        onSelect={vi.fn()}
        selectedId="card"
      />,
    );

    expect(screen.getByRole('option', { name: 'Card' })).toHaveAttribute('aria-current', 'true');
  });
});
