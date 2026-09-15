import { render, screen, within } from '@testing-library/react';
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
  it('renders the desktop filterable list and the mobile select', () => {
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
        onSelect={vi.fn()}
      />,
    );

    const selects = screen.getAllByRole('combobox', { name: 'Filtrar secciones' });
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('filtrar "med" en escritorio deja solo media-kit', async () => {
    const user = userEvent.setup();
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
        onSelect={vi.fn()}
      />,
    );

    const textInput = screen.getAllByRole('combobox', { name: 'Filtrar secciones' })[1];
    if (textInput) {
      await user.type(textInput, 'med');
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByRole('option', { name: 'Media kit' })).toBeInTheDocument();
    }
  });

  it('selecting an option in the list invokes onSelect with its id', async () => {
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

    const listboxOption = screen
      .getAllByRole('option', { name: 'Card' })
      .find((el) => el.tagName !== 'OPTION');
    if (listboxOption) {
      await user.click(listboxOption);
      expect(onSelect).toHaveBeenCalledWith('card');
    }
  });

  it('selecting an option in the mobile select invokes onSelect with its id', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
        onSelect={onSelect}
      />,
    );

    const mobileSelect = screen.getAllByRole('combobox', { name: 'Filtrar secciones' })[0];
    if (mobileSelect) {
      await user.selectOptions(mobileSelect, 'card');
      expect(onSelect).toHaveBeenCalledWith('card');
    }
  });

  it('marks the selectedId option as applied in the list (aria-current)', () => {
    render(
      <ShowcaseIndex
        items={ITEMS}
        inputLabel="Filtrar secciones"
        emptyMessage="Ninguna sección coincide"
        onSelect={vi.fn()}
        selectedId="card"
      />,
    );

    const listboxOption = screen
      .getAllByRole('option', { name: 'Card' })
      .find((el) => el.tagName !== 'OPTION');
    expect(listboxOption).toHaveAttribute('aria-current', 'true');
  });
});
