import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
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
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Filtrar secciones' }), 'med');

    expect(screen.getByRole('option', { name: 'Media kit' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('seleccionar una sección cambia location.hash sin perder el filtro', async () => {
    const user = userEvent.setup();
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
      />,
    );

    await user.click(screen.getByRole('option', { name: 'Card' }));

    expect(window.location.hash).toBe('#card');
  });
});
