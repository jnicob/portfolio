import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterableList, type FilterableItem } from './filterable-list';

const ITEMS: readonly FilterableItem[] = [
  { id: 'button', label: 'Button', keywords: ['cta'] },
  { id: 'badge', label: 'Badge' },
  { id: 'tabs', label: 'Tabs' },
];
const noop = () => {};

describe('FilterableList', () => {
  it('filtra en vivo por label y keywords', async () => {
    const user = userEvent.setup();
    render(
      <FilterableList
        items={ITEMS}
        inputLabel="Componentes"
        emptyMessage="Sin resultados"
        onSelect={() => {}}
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Componentes' }), 'cta');

    expect(screen.getByRole('option', { name: 'Button' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Badge' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Tabs' })).not.toBeInTheDocument();
  });

  it('teclado completo: ↓↓ activa la tercera, Enter la selecciona', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <FilterableList
        items={ITEMS}
        inputLabel="Componentes"
        emptyMessage="Sin resultados"
        onSelect={onSelect}
      />,
    );

    const combobox = screen.getByRole('combobox', { name: 'Componentes' });
    await user.click(combobox);
    await user.keyboard('{ArrowDown}{ArrowDown}');

    const tabsOption = screen.getByRole('option', { name: 'Tabs' });
    expect(combobox).toHaveAttribute('aria-activedescendant', tabsOption.id);

    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(ITEMS[2]);
  });

  it('Escape limpia el filtro y restaura la lista completa', async () => {
    const user = userEvent.setup();
    render(
      <FilterableList
        items={ITEMS}
        inputLabel="Componentes"
        emptyMessage="Sin resultados"
        onSelect={() => {}}
      />,
    );

    const combobox = screen.getByRole('combobox', { name: 'Componentes' });
    await user.type(combobox, 'cta');
    expect(screen.queryByRole('option', { name: 'Badge' })).not.toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(combobox).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Button' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Badge' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tabs' })).toBeInTheDocument();
  });

  it('sin resultados muestra el estado vacío con role status', async () => {
    const user = userEvent.setup();
    render(
      <FilterableList
        items={ITEMS}
        inputLabel="Componentes"
        emptyMessage="Sin coincidencias"
        onSelect={() => {}}
      />,
    );

    await user.type(screen.getByRole('combobox', { name: 'Componentes' }), 'zzz');

    expect(screen.getByRole('status')).toHaveTextContent('Sin coincidencias');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('ARIA: combobox apunta al listbox y las opciones tienen id estable', () => {
    render(
      <FilterableList
        items={ITEMS}
        inputLabel="Componentes"
        emptyMessage="Sin resultados"
        onSelect={() => {}}
      />,
    );

    const combobox = screen.getByRole('combobox', { name: 'Componentes' });
    const listbox = screen.getByRole('listbox');
    expect(combobox).toHaveAttribute('aria-controls', listbox.id);

    const option = screen.getByRole('option', { name: 'Button' });
    expect(option.id).toMatch(/-option-button$/);
    // El id se mantiene estable entre renders (misma instancia montada).
    expect(screen.getByRole('option', { name: 'Button' }).id).toBe(option.id);
  });

  it('marca el item selectedId con aria-current y ✓, y arranca como opción activa', () => {
    render(
      <FilterableList
        items={ITEMS}
        inputLabel="Filtrar"
        emptyMessage="Nada"
        onSelect={noop}
        selectedId={ITEMS[1]!.id}
      />,
    );
    const option = screen.getByRole('option', { name: new RegExp(ITEMS[1]!.label) });
    expect(option).toHaveAttribute('aria-current', 'true');
    expect(option).toHaveTextContent('✓');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', option.id);
  });

  it('mover el ratón sobre una opción la convierte en la activa', () => {
    render(
      <FilterableList items={ITEMS} inputLabel="Filtrar" emptyMessage="Nada" onSelect={noop} />,
    );
    const target = screen.getByRole('option', { name: new RegExp(ITEMS[2]!.label) });
    fireEvent.mouseMove(target);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', target.id);
  });

  it('las opciones tienen efecto hover', () => {
    render(
      <FilterableList items={ITEMS} inputLabel="Filtrar" emptyMessage="Nada" onSelect={noop} />,
    );
    expect(screen.getAllByRole('option')[0]).toHaveClass('hover:bg-surface');
  });
});
